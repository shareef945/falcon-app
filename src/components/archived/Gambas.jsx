import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import "react-multi-carousel/lib/styles.css";
import { PieChart } from "react-minimal-pie-chart";
import Slider from "react-slick";

export default function Gambas() {
  const customer = JSON.parse(sessionStorage.getItem("falcon-auth-token"));
  let navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [activeProducts, setActiveProducts] = useState([]);

  var paid = 0;
  var balance = 0;

  var productID = "[Select Product]";
  var interestCharge = "[Select Product]";
  var installmentAmount = "[Select Product]";
  var repaymentMode = "[Select Product]";

  var settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const columns = [
    { field: "_id", headerName: "ID", flex: 1 },
    { field: "Amount Received", headerName: "Amount", flex: 1 },
    { field: "Date Received", headerName: "Date", flex: 1 },
  ];

  const [productData, setProductData] = useState({
    productID: productID,
    interestCharge: interestCharge,
    installmentAmount: installmentAmount,
    repaymentMode: repaymentMode,
    paid: paid,
    balance: balance,
  });

  function getProductData() {
    fetch(
      process.env.REACT_APP_API_URL+`/transactions/${productData["productID"]}`
    )
      .then((data) => data.json())
      .then((data) => setTableData(data));
  }

  //i removed the [] from the use effect and it works now but its buggy u feel me

  useEffect(() => {
    fetch(
      process.env.REACT_APP_API_URL+`/products/customer/${customer["Customer ID"]}`
    )
      .then((data) => data.json())
      .then((data) => setActiveProducts(data));
  }, []);

  const [selectedCard, setSelectedCard] = useState(activeProducts[0]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [divStyle, setDivStyle] = useState({});

  return (
    <div>
      <div className="dashboard-top-bar">
        <h3>Hi {customer["First Name"]}</h3>
        <div className="dashheader">
          <div className="group-btn-row" style={{ padding: 0 }}>
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
      </div>
      <div>
        <div>
          <div
            style={{
              height: "200px",
              marginLeft: "10%",
              marginTop: "15px",
              marginRight: "100px",
            }}
            className="row-responsive">
            <div style={{ width: "500px" }}>
              <h2> Your Active Products </h2>
              <Slider {...settings}>
                {activeProducts.map((item, index) => {
                  function setCard() {
                    setProductData({
                      productID: item["Product ID"],
                      installmentAmount: item["Installment Amount"],
                      repaymentMode: item["Repayment Frequency"],
                      interestCharge: item["Interest"],
                      paid: item["Sale Value"] - item["Balance"],
                      balance: item["Balance"],
                    });
                  }

                  return (
                    <div
                      key={index}
                      style={{ margin: "0 10% 0 10%", gap: "10px" }}>
                      <div className="card" style={{ borderRadius: "5px" }}>
                        <div
                          className="card-body"
                          style={
                            selectedCard == item
                              ? {
                                  backgroundColor: "#FF7700",
                                  color: "white",
                                  borderRadius: "15px",
                                  padding: "5px 30px 20px 30px",
                                  margin: "0% 5% 0% 0%",
                                }
                              : {
                                  backgroundColor: "#2A2550",
                                  color: "white",
                                  borderRadius: "15px",
                                  padding: "5px 30px 20px 30px",
                                  margin: "0% 5% 0% 0%",
                                }
                          }
                          onClick={() => {
                            setSelectedCard(item);
                            setSelectedCardIndex(index);
                            getProductData();
                            setCard();
                          }}>
                          <h5 className="card-title">{item["Product ID"]}</h5>
                          <p className="card-text">
                            Loan Amount: {item["Sale Value"]}
                            <br />
                            Balance: {item["Balance"]}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}>
                            <a
                              href="#"
                              className="btn btn-primary product-link"
                              style={{
                                color: "white",
                                textDecoration: "none",
                              }}>
                              Pay
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Slider>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginLeft: "auto",
              }}
              className="previewContainer">
              <div>
                <PieChart
                  className="chart"
                  data={[
                    { value: parseInt(productData.paid), color: "#2A2550" },
                    { value: parseInt(productData.balance), color: "#FF7700" },
                  ]}
                  lineWidth="50"
                />
                <div
                  className="col-start"
                  style={{
                    display: "flex",
                    gap: "16px",
                    flexDirection: "row",
                  }}>
                  <div>
                    <p className="interest">Paid</p>
                    <p className="principal">Remaining</p>
                  </div>
                  <div>
                    <p className="interest">₵{productData.paid}</p>
                    <p className="principal">₵{productData.balance}</p>
                  </div>
                </div>
              </div>
              <div className="previewContainer">
                <p style={{ fontWeight: "bold" }}>Product ID</p>
                <p>{productData.productID}</p>
                <p style={{ fontWeight: "bold" }}>Interest Charged</p>
                <p>{productData.interestCharge * 100}% </p>
                <p style={{ fontWeight: "bold" }}>Installment Amount</p>
                <p>{productData.installmentAmount}</p>
                <p style={{ fontWeight: "bold" }}>Repayment Mode</p>
                <p>{productData.repaymentMode}</p>
                <p>-------------------</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Grid container spacing={2} justify="center">
            <div
              style={{
                marginTop: "10%",
                marginLeft: "10%",
                height: 200,
                width: "80%",
              }}>
              <p style={{ marginBottom: "1.5%" }}>Transaction History</p>
              <div>
                <p
                  style={{
                    marginBottom: "1.5%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}>
                  Keep track of all your transactions
                  <Link to="transactions" state={{ tableData }}>
                    <svg
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        fill="none"
                        stroke="#000"
                        stroke-width="2"
                        d="M10,14 L2,22 M1,15 L1,23 L9,23 M22,2 L14,10 M15,1 L23,1 L23,9"
                      />
                    </svg>
                  </Link>
                </p>
              </div>

              <DataGrid
                rows={tableData}
                columns={columns}
                getRowId={(row) => row._id}
                pageSize={12}
              />
            </div>
          </Grid>
        </div>
      </div>
    </div>
  );
}