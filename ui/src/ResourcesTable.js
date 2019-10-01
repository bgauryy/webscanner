import React from "react";
import ReactTable from "react-table";
import ReactJson from 'react-json-view'
import "react-table/react-table.css";

export class ResourcesTable extends React.Component {
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
                            id: 'Host',
                            width: 220,
                            Header: "Host",
                            accessor: "host",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row._original.host);
                            }
                        },
                        {
                            Header: "initiator",
                            accessor: "initiator",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.initiator);
                            }
                        },
                        {
                            Header: "initiatorStack",
                            accessor: "initiatorStack",
                            resized: true,
                            Cell: obj => {
                                const data = obj.row.initiatorStack;
                                return <ReactJson collapsed={true} src={data}/>
                            }
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
                            id: 'timestamp',
                            Header: "timestamp",
                            accessor: "timestamp",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.timestamp);
                            }
                        },
                        {
                            Header: "type",
                            accessor: "type",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.type);
                            }
                        },
                        {
                            Header: "method",
                            accessor: "method",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.method);
                            }
                        },
                        {
                            Header: "res_length",
                            accessor: "response_length",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.response_length);
                            }
                        },
                        {
                            Header: "mimeType",
                            accessor: "mimeType",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.mimeType);
                            }
                        },
                        {
                            Header: "ip",
                            accessor: "ip",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.ip);
                            }
                        },
                        {
                            Header: "status",
                            accessor: "status",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.status);
                            }
                        },
                        {
                            Header: "cipher",
                            accessor: "cipher",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.cipher);
                            }
                        },
                        {
                            Header: "issuer",
                            accessor: "issuer",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.issuer);
                            }
                        },
                        {
                            Header: "sanList",
                            accessor: "sanList",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.sanList);
                            }
                        }
                    ]}
                    defaultPageSize={50}
                    className="-striped -highlight"
                    sorted={[{
                        id: 'timestamp',
                        desc: false
                    }, {
                        id: 'Host',
                        desc: true
                    }]}
                />
            </div>
        );
    }
}
