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
                            width: 120,
                            id: 'Time',
                            Header: "Time",
                            accessor: "timestamp",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.timestamp);
                            }
                        },
                        {
                            width: 70,
                            Header: "Method",
                            accessor: "req_method",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.req_method);
                            }
                        },
                        {
                            width: 60,
                            Header: "Status",
                            accessor: "res_status",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.res_status);
                            }
                        },
                        {
                            id: 'Host',
                            width: 200,
                            Header: "Host",
                            accessor: "host",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row._original.host);
                            }
                        },
                        {
                            width: 300,
                            Header: "Path",
                            accessor: "pathname",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row._original.pathname);
                            }
                        },
                        {
                            width: 215,
                            Header: "QueryParams",
                            accessor: "queryParams",
                            resized: true,
                            Cell: obj => {
                                const data = obj.row.queryParams;
                                return <ReactJson collapsed={true} src={data}/>
                            }
                        },
                        {
                            width: 215,
                            Header: "HashParams",
                            accessor: "hashParams",
                            resized: true,
                            Cell: obj => {
                                const data = obj.row.hashParams;
                                return <ReactJson collapsed={true} src={data}/>
                            }
                        },
                        {
                            width: 90,
                            Header: "Initiator",
                            accessor: "initiator",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.initiator);
                            }
                        },
                        {
                            width: 215,
                            Header: "InitiatorStack",
                            accessor: "initiatorStack",
                            resized: true,
                            Cell: obj => {
                                const data = obj.row.initiatorStack;
                                return <ReactJson collapsed={true} src={data}/>
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
                            width: 200,
                            Header: "FrameURL",
                            accessor: "frameURL",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row._original.frameURL);
                            }
                        },
                        {
                            Header: "req_type",
                            accessor: "req_type",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.req_type);
                            }
                        },
                        {
                            width: 120,
                            Header: "req_url_length",
                            accessor: "req_url_length",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.req_url_length);
                            }
                        },
                        {
                            width: 120,
                            Header: "req_data",
                            accessor: "req_post_data",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.req_post_data);
                            }
                        },
                        {
                            width: 120,
                            Header: "req_data_length",
                            accessor: "req_post_data_length",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.req_post_data_length);
                            }
                        },
                        {
                            width: 215,
                            Header: "req_headers",
                            accessor: "req_headers",
                            resized: true,
                            Cell: obj => {
                                const data = obj.row.req_headers;
                                return <ReactJson collapsed={true} src={data}/>
                            }, filterMethod: (filter, row) => {

                            for (const prop in row.req_headers) {
                                if (new RegExp(filter.value).test(prop)) {
                                    return true;
                                }
                            }
                            return false;
                        }
                        },
                        //Response
                        {
                            Header: "res_length",
                            accessor: "res_length",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.res_length);
                            }
                        },
                        {
                            width: 180,
                            Header: "res_mimeType",
                            accessor: "res_mimeType",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row._original.res_mimeType);
                            }
                        },
                        {
                            width: 115,
                            Header: "res_ip",
                            accessor: "res_ip",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row._original.res_ip);
                            }
                        },
                        {
                            width: 70,
                            Header: "res_port",
                            accessor: "res_port",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row._original.res_port);
                            }
                        },
                        {
                            width: 215,
                            Header: "res_headers",
                            accessor: "res_headers",
                            resized: true,
                            Cell: obj => {
                                const data = obj.row.res_headers;
                                return <ReactJson collapsed={true} src={data}/>
                            }, filterMethod: (filter, row) => {

                            for (const prop in row.res_headers) {
                                if (new RegExp(filter.value).test(prop)) {
                                    return true;
                                }
                            }
                            return false;
                        }
                        },
                        {
                            width: 130,
                            Header: "cert_cipher",
                            accessor: "cert_cipher",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.cert_cipher);
                            }
                        },
                        {
                            width: 185,
                            Header: "cert_issuer",
                            accessor: "cert_issuer",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.cert_issuer);
                            }
                        },
                        {
                            width: 300,
                            Header: "cert_sanList",
                            accessor: "cert_sanList",
                            filterMethod: (filter, row) => {
                                return new RegExp(filter.value).test(row.cert_sanList);
                            },
                            Cell: obj => {
                                const data = obj.row.cert_sanList;
                                return <ReactJson collapsed={true} src={data}/>
                            }
                        }
                    ]}
                    defaultPageSize={20}
                    className="-striped -highlight"
                    sorted={[{
                        id: 'Time',
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
