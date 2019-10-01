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
                            width: 100,
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
                            id: "length",
                            width: 100,
                            Header: "length",
                            accessor: "length",
                            filterable: false
                        },
                        {
                            Header: "URL",
                            accessor: "url",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.url);
                            }
                        },
                        {
                            Header: "frame",
                            accessor: "frame",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.frame);
                            }
                        },
                        {
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
                    defaultPageSize={50}
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
