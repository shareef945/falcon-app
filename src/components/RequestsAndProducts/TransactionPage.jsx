import ArrowForward from "@mui/icons-material/ArrowForward";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function TransactionPage() {

  const [tableData, setTableData] = useState(useLocation().state.tableData);
  let navigate = useNavigate();

  const columns = [
    { field: "_id", headerName: "ID", flex: 1 },
    { field: "Amount Received", headerName: "Amount", flex: 1 },
    { field: "Date Received", headerName: "Date", flex: 1 },
  ];


  const customer = JSON.parse(sessionStorage.getItem("falcon-auth-token"));

  return (
    <div>
      <div className="dashboard-top-bar">
        <a href="/">
          {" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-arrow-left">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </a>

        <h3 style={{ marginLeft: "3%" }}>Hi {customer["First Name"]}</h3>
        <div className="group-btn-row" style={{ marginLeft: "60%" }}>
          <button className="primary-btn">
            <Link to="managerequests" className="no-text-decoration">
              Manage my requests
            </Link>
          </button>

          <Button
            onClick={() => {
              navigate("requestaloan");
            }}
            style={{
              borderRadius: 12,
              backgroundColor: "#2A2550",
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
      </div>

      <Grid container spacing={2} justify="center">
        <div
          style={{
            marginTop: "10%",
            marginLeft: "10%",
            height: 450,
            width: "80%",
          }}>
          <p style={{ marginBottom: "1.5%" }}>Transaction History</p>
          <p style={{ marginBottom: "1.5%" }}>
            Keep track of all your transactions
          </p>
          <DataGrid
            rows={tableData}
            columns={columns}
            getRowId={(row) => row._id}
            pageSize={12}
          />
        </div>
      </Grid>
    </div>
  );
}
