import React, { useEffect } from "react";

import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useState } from "react";
import { formatDate, TablePaginationActions } from "../utils/UsefulFunctions";

import { ArrowForward } from "@mui/icons-material";
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import PropTypes from 'prop-types';
import { Button } from "react-bootstrap";
import { CheckCircle, Frown, Info, MousePointer, XCircle } from "react-feather";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import { prettifyNumber } from '../utils/UsefulFunctions';

const StyledTableCell = styled(TableCell)(({ theme }) => ({

    [`&.${tableCellClasses.head}`]: {
        fontWeight: 700,
    },
}));



// Use TablePaginationActions
TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};


export default function ManageRequests() {
    const customer = JSON.parse(sessionStorage.getItem("falcon-auth-token"));
    const [requests, setRequests] = useState([]);
    const [count, setCount] = useState(0);
    const [working, setWorking] = useState(true);

    const [selectedRow, setSelectedRow] = useState([]);
    const [selectedRowIndex, setSelectedRowIndex] = useState(0);

    async function getRequests() {
        //https://8k7pdn.deta.dev/api/products
        // "http://localhost:8443/api/login"
        return fetch(process.env.REACT_APP_API_URL + "products/customer/" + customer["_id"], {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(data => data.json()).catch(error => console.log(error))
    }

    async function getProducts() {
        const response = await getRequests();
        // console.log("request api response:", response);
        if (response.message === undefined) {
            // requests loaded
            setRequests(response);
            setCount(1);
            setWorking(false);

        } else {

        }
    }

    useEffect(() => {
        document.title = "Falcon | Manage your requests";
        if (count < 1) {
            getProducts();
        }
    });


    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - requests.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const navigate = useNavigate();

    function modifyReqNavigate(selectedRow) {
        if (selectedRow["Request Status"] === "In Progress") {
            navigate('/modifyrequest/' + selectedRow["Product ID"], {
                state: {
                    request: selectedRow
                }
            });
        }


    }

    async function updateRequest(request, requestID) {
        return fetch(process.env.REACT_APP_API_URL + "products/" + requestID, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        }).then(data => data.json()).catch(error => console.log(error))
    }

    async function patchRequest(requestID) {
        const update = { "Request Status": "Withdrawn" };
        let updateRequestResult = await updateRequest(update, requestID);
        if (updateRequestResult.status !== 400) {
            setWorking(false);
            requests[selectedRowIndex]["Request Status"] = "Withdrawn";

        }
    }


    return (
        <div className="body-padding">
            <h3>Manage Your Requests</h3>
            {working ? <BeatLoader />
                :
                requests.length === 0 ?
                    <div>
                        <p style={{marginBottom: "16px"}}>You have no pending requests. Click the button below to get started with requesting a loan.</p>
                        <Button
                            onClick={() => {
                                navigate("/requestaloan");
                            }}
                            style={{
                                borderRadius: 12,
                                backgroundColor: "#2A2550",
                                color: "white",
                                padding: "8px 16px",
                                textTransform: "none",
                                fontFamily: "-apple-system,'Inter', sans-serif",
                                fontWeight: "300",
                                fontSize: "16px",
                            }}
                            variant="contained"
                            endIcon={<ArrowForward />}>
                            Request a Loan
                        </Button>
                    </div>
                    :
                    <div className="row-responsive" style={{ margin: 0, paddingTop: "16px" }}>
                        <TableContainer sx={{ maxWidth: 700 }} style={{ border: "1px solid #E7E8F2", borderRadius: "12px" }} elevation={0} component={Paper}>
                            <Table size="small" sx={{ maxWidth: 700 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Product ID</StyledTableCell>
                                        <StyledTableCell>Category</StyledTableCell>
                                        <StyledTableCell >Principal</StyledTableCell>
                                        <StyledTableCell>Interest</StyledTableCell>
                                        <StyledTableCell>Term</StyledTableCell>
                                        <StyledTableCell>Status</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(rowsPerPage > 0
                                        ? requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        : requests)
                                        .map((row, index) => (
                                            <TableRow
                                                onClick={() => {
                                                    setSelectedRow(row)
                                                    setSelectedRowIndex(index);
                                                    // style selected row with highlight
                                                }
                                                }
                                                key={row.id}
                                                sx={selectedRow == row ? {
                                                    '&.MuiTableRow-root:hover': {
                                                        backgroundColor: '#F9F3EE',
                                                        border: "2px #FF7700 solid",
                                                    }, '&.MuiTableRow-root': {
                                                        backgroundColor: '#F9F3EE',
                                                        border: "2px #FF7700 solid"
                                                    }, "&.Mui-selected:selected, &.Mui-selected:hover": {
                                                        backgroundColor: "purple",
                                                        "& > .MuiTableCell-root": {
                                                            color: "yellow"
                                                        }
                                                    }
                                                } : {
                                                    '&.MuiTableRow-root:hover': {
                                                        backgroundColor: '#F9F3EE',
                                                        border: "2px #FF7700 solid",
                                                    }, "&.Mui-selected:selected, &.Mui-selected:hover": {
                                                        backgroundColor: "purple",
                                                        "& > .MuiTableCell-root": {
                                                            color: "yellow"
                                                        }
                                                    }
                                                }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    <p>{row["Product ID"]}</p>
                                                </TableCell>
                                                <TableCell><p>{row["Product Category"]}</p></TableCell>
                                                <TableCell><p>₵{prettifyNumber(row.Principal)}</p></TableCell>
                                                <TableCell><p>₵{prettifyNumber(row.Interest)}</p></TableCell>
                                                <TableCell><p>{row.Tenure} {row["Tenure Unit"] === "year" && row.Tenure > 1 ? "years" : row["Tenure Unit"]}</p></TableCell>
                                                <TableCell><div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>{row["Request Status"] === "Approved" ? <CheckCircle fill="white" color="green" /> : row["Request Status"] === "Withdrawn" ? <Frown fill="white" color="grey" /> : row["Request Status"] === "Rejected" ? <XCircle fill="red" color="white" /> : <Info color="white" fill="#FDC571" />}<p>{row["Request Status"]}</p></div></TableCell>

                                            </TableRow>
                                        ))}
                                    {emptyRows > 0 && (
                                        <TableRow style={{ height: 53 * emptyRows }}>
                                            <TableCell colSpan={6} />
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 15, { label: 'All', value: -1 }]}
                                            colSpan={6}
                                            count={requests.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            SelectProps={{
                                                inputProps: {
                                                    'aria-label': 'rows per page',
                                                },
                                                native: true,
                                            }}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            ActionsComponent={TablePaginationActions}
                                        />
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                        {selectedRow["Request Status"] === "Approved" ?
                            <div className="icon-text" style={{ background: "#dedcdc", padding: "4px 8px", borderRadius: "8px" }}>
                                <Info size={22}/>
                                <p style={{ fontSize: "14px"}}>As your loan has been approved, you can't withdraw your request.</p>
                            </div>
                            :
                            ""
                        }
                        {selectedRow.length !== 0 ? <div className="info-container" style={{ width: "max-content" }}>
                            <div style={{ display: "flex", flexDirection: "row", padding: 0, alignItems: "stretch" }}>

                                <div style={{ borderTop: '1px solid #E7E8F2', borderLeft: '1px solid #E7E8F2', borderBottom: '1px solid #E7E8F2', borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px", display: "flex", flexDirection: "column", gap: "16px", padding: "16px" }}>

                                    <h4>1. Loan Application</h4>
                                    <h4 className={selectedRow["Request Status"] === "In Progress" || selectedRow["Request Status"] === "Approved" ? "" : "text-disabled"}>2. Application Review</h4>
                                    <h4 className={selectedRow["Request Status"] === "Approved" && selectedRow["Product Status"] === "Active" ? "" : "text-disabled"}>3. Funds Disbursed</h4>
                                    <h4 className={selectedRow["Product Status"] === ["Repaid"] ? "" : "text-disabled"}>4. Loan Repaid</h4>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", background: "#F6F6F6", borderTopRightRadius: "12px", borderBottomRightRadius: "12px", textAlign: "center" }}>

                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                        <h4>Request date</h4>
                                        <p>{formatDate(selectedRow["Request Date"])}</p>

                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>

                                        <h4>Installment amount</h4>
                                        <p>₵{prettifyNumber(selectedRow["Installment Amount"])}</p>

                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>

                                        <h4>Repayment frequency</h4>
                                        <p>{selectedRow["Repayment Frequency"]}</p>

                                    </div>

                                </div>

                            </div>

                            <Toaster />

                            <div className="equal-space-group-btn-row ">

                                <button className={selectedRow["Request Status"] === "In Progress" ? "one-of-two-equal-primary-btn" : "one-of-two-equal-primary-btn-disabled"}
                                    onClick={() => { modifyReqNavigate(selectedRow) }}>
                                    Modify Request
                                </button>

                                <button className={selectedRow["Request Status"] === "In Progress" ? "one-of-two-equal-primary-btn" : "one-of-two-equal-primary-btn-disabled"}
                                    style={selectedRow["Request Status"] === "In Progress" ? { backgroundColor: "red" } : {}}
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to withdraw your request?")) {
                                            patchRequest(selectedRow["_id"]);
                                            setWorking(true);
                                        }
                                    }}
                                >
                                    Withdraw Request
                                </button>
                            </div>
                        </div> : <div className="icon-text"><MousePointer color="#FF7700" /><h4>Select a row to view some more details.</h4></div>}

                    </div>}

        </div>
    )
}


