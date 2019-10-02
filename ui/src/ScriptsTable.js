import React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import ReactJson from 'react-json-view'

export class ScriptsTable extends React.Component {
    constructor(props) {
        super();
        this.state = {data: props.data};
    }

    render() {
        const {data} = this.state;
        return (
            <div>
                <ReactTable
                    data={data}
                    filterable
                    defaultFilterMethod={(filter, row) =>
                        String(row[filter.id]) === filter.value}
                    columns={[
                        {
                            width: 65,
                            Header: "ScriptId",
                            accessor: "scriptId",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.scriptId);
                            }
                        },
                        {
                            id: 'Host',
                            width: 220,
                            Header: "Host",
                            accessor: "host",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row._original.host);
                            }
                        },
                        {
                            Header: "PathName",
                            accessor: "pathname",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row._original.pathname);
                            }
                        },
                        {
                            id: "Size",
                            width: 75,
                            Header: "Size (KB)",
                            accessor: "size",
                            filterable: false
                        },
                        {
                            width: 80,
                            Header: "FrameId",
                            accessor: "frameId",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row._original.frameId);
                            }
                        },
                        {
                            width: 220,
                            Header: "FrameURL",
                            accessor: "frameURL",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row._original.frameURL);
                            }
                        },
                        {
                            width: 215,
                            Header: "Events",
                            accessor: "events",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.events);
                            },
                            Cell: obj => {
                                const data = obj.row.events;
                                return <ReactJson collapsed={true} src={data}/>
                            }
                        },
                        {
                            Header: "Source",
                            accessor: "source",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.source);
                            }
                        }
                    ]}
                    defaultPageSize={20}
                    className="-striped -highlight"
                    sorted={[{
                        id: 'Host',
                        desc: true
                    }, {
                        id: 'size',
                        desc: true
                    }]}
                />
            </div>
        );
    }
}
