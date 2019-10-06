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
                                return new RegExp(filter.value).test(row.ScriptId);
                            }
                        },
                        {
                            width: 130,
                            Header: "ParentScriptId",
                            accessor: "parentScriptId",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.parentScriptId)
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
                            width: 420,
                            Header: "Path",
                            accessor: "pathname",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row._original.pathname);
                            }
                        },
                        {
                            id: "Length",
                            width: 75,
                            Header: "Length",
                            accessor: "length",
                            filterable: false
                        },
                        {
                            width: 90,
                            Header: "Module",
                            accessor: "isModule",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.isModule);
                            }
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
                            Cell: props => {
                                const data = props.row.events;
                                return data ? <ReactJson collapsed={true} src={data}/> : <p>-</p>;
                            }
                        },
                        {
                            width: 215,
                            Header: "stackTrace",
                            accessor: "stackTrace",
                            resized: true,
                            Cell: obj => {
                                const data = obj.row.stackTrace;
                                return data ? <ReactJson collapsed={true} src={data}/> : <p>-</p>;
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
                        id: 'length',
                        desc: true
                    }]}
                />
            </div>
        );
    }
}
