/* global d3, jsonTree */
const screenWidth = window.screen.width;
const screenHeight = window.screen.height;

const objectViewContainer = document.getElementById('objectViewContainer');

const svgEl = document.getElementsByTagName('svg')[0];
svgEl.setAttribute('width', screenWidth);
svgEl.setAttribute('height', `${Math.round(screenHeight * 0.6)}`);

const svg = d3.select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');
const color = d3.scaleOrdinal(d3.schemeCategory20);
const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(function (d) {
        return d.id;
    }).distance(getNodeDistance))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2));

const groups = {
    frame: 1,
    script: 2,
    network: 3,
    events: 4
};

const typeColor = {
    frame: 'blue',
    script: 'green',
    network: 'red'
};

let objectViewDiv;

getGraphData()
    .then(createGraph);

function createGraph(data) {
    const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(data.links)
        .enter().append('line')
        .style('stroke', getLinkColor);


    const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(data.nodes)
        .enter().append('g')
        .on('click', onClickedNode);

    node.append('circle')
        .attr('r', 10)
        .attr('fill', function (d) {
            return color(d.group);
        })
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    node.append('text')
        .text(function (d) {
            return d.label;
        })
        .attr('x', 6)
        .attr('y', 3);

    node.append('title')
        .text(function (d) {
            return d.id;
        });

    simulation
        .nodes(data.nodes)
        .on('tick', ticked);

    simulation.force('link')
        .links(data.links);


    function ticked() {
        link
            .attr('x1', function (d) {
                return d.source.x;
            })
            .attr('y1', function (d) {
                return d.source.y;
            })
            .attr('x2', function (d) {
                return d.target.x;
            })
            .attr('y2', function (d) {
                return d.target.y;
            });
        node
            .attr('transform', function (d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function getLinkColor(node) {
        return typeColor[node.type];
    }

    let tree;

    function onClickedNode(node) {
        if (tree) {
            tree.delete();
        }
        objectViewDiv = document.createElement('div');
        objectViewContainer.appendChild(objectViewDiv);
        objectViewDiv.style.maxWidth = Math.round(screenWidth * 0.3);
        objectViewDiv.style.height = Math.round(screenHeight * 0.8);
        tree = jsonTree.create(node.obj, objectViewDiv);
    }
}

async function getGraphData() {
    const graphData = {
        nodes: [],
        links: []
    };
    const response = await fetch('data.json');
    const json = await response.json();

    //Add scritps to frames
    for (let i = 0; i < json.scripts.length; i++) {
        const script = json.scripts[i];
        const frameId = script.frameId;
        const frame = json.frames[frameId];
        frame.scripts = frame.scripts || [];
        frame.scripts.push(script);
    }

    //Add network to frames
    for (let i = 0; i < json.network.length; i++) {
        const network = json.network[i];
        const frameId = network.frameId;
        const frame = json.frames[frameId];
        frame.network = frame.network || [];
        frame.network.push(network);
    }

    //Frames
    const frames = json.frames;
    //eslint-disable-next-line
    for (const prop in frames) {
        const frame = frames[prop];
        graphData.nodes.push({label: getOrigin(frame.url), id: frame.frameId, group: groups.frame, obj: frame});

        //Default frame
        if (!frame.parentId && !frame.parentFrameId) {
            const events = {};
            for (let i = 0; i < json.events.length; i++) {
                const event = json.events[i];
                const eventType = event.type;
                const scriptId = event.scriptId;
                //TODO - check for bug of script without url
                const scripts = json.scripts.filter(s => s.scriptId === scriptId);
                const initiator = scripts && scripts[0] && scripts[0].url || 'blank';

                events[initiator] = events[initiator] || {};
                events[initiator][eventType] = events[initiator][eventType] || [];
                events[initiator][eventType].push(event);
            }
            const eventsId = uuidv4();
            graphData.nodes.push({label: 'Events', id: eventsId, group: groups.events, obj: events});
            graphData.links.push({source: frame.frameId, target: eventsId, type: typeColor.network});
        }

        if (frame.parentId) {
            //eslint-disable-next-line
            for (const prop in frames) {
                const parentFrameId = frames[prop].id;
                if (parentFrameId === frame.parentId) {
                    // graphData.links.push({ source: parentFrameId, target: frame.frameId, type: typeColor.frame });
                    break;
                }
            }
        }
        setFrameNodes(frame, graphData);
    }
    return graphData;
}

function setFrameNodes(frame, graphData) {
    const networkCollection = frame.network && Array.from(frame.network) || [];
    const scriptsCollection = frame.scripts && Array.from(frame.scripts) || [];
    delete frame.network;
    delete frame.scripts;


    //Set Network
    const networkHosts = {};
    for (let i = 0; i < networkCollection.length; i++) {
        const networkObj = networkCollection[i];
        const requestOrigin = getOrigin(networkObj.url);
        networkHosts[requestOrigin] = networkHosts[requestOrigin] || [];
        networkHosts[requestOrigin].push(networkObj);
    }
    if (networkCollection.length > 0) {
        const networkId = uuidv4();
        graphData.nodes.push({label: 'Network', id: networkId, group: groups.network, obj: networkHosts});
        graphData.links.push({source: frame.frameId, target: networkId, type: typeColor.network});
    }

    const scriptsHosts = {};
    for (let i = 0; i < scriptsCollection.length; i++) {
        const scriptObj = scriptsCollection[i];
        const scriptOrigin = getOrigin(scriptObj.url);
        scriptsHosts[scriptOrigin] = scriptsHosts[scriptOrigin] || [];
        scriptsHosts[scriptOrigin].push(scriptObj);
    }
    if (scriptsCollection.length > 0) {
        const scriptsId = uuidv4();
        graphData.nodes.push({label: 'Script', id: scriptsId, group: groups.script, obj: scriptsHosts});
        graphData.links.push({source: frame.frameId, target: scriptsId, type: typeColor.script});
    }
}

function getOrigin(url) {
    try {
        if (/^data:image/.test(url)) {
            return 'data:image';
        }
        const origin = url ? new URL(url).origin : 'about:blank';
        return (origin === 'null') ? url : origin || 'about:blank';
    } catch (e) {
        return url;
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getNodeDistance() {
    return 35;
}
