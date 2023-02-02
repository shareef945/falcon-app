import { InfoRounded } from "@mui/icons-material";
import ArrowForward from "@mui/icons-material/ArrowForward";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { Maximize2 } from "react-feather";
import { toast, Toaster } from "react-hot-toast";
import { PieChart } from "react-minimal-pie-chart";
import "react-multi-carousel/lib/styles.css";
import { useMediaQuery } from "react-responsive";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { BeatLoader } from "react-spinners";
import PaymentModal from "./PaymentModal";
import { getProductData } from "./utils/APICalls";
import { dateOrdinal, formatDate, getDay, nextPaymentDayOfMonth, nextPaymentDayOfWeek, notToday, prettifyNumber } from "./utils/UsefulFunctions";
import welcome from './utils/welcome.json';


export default function Dashboard() {
  const customer = JSON.parse(sessionStorage.getItem("falcon-auth-token"));
  let navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [activeProducts, setActiveProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [paying, setPaying] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1000px)' });
  const [selectedCard, setSelectedCard] = useState(null);

  // toggle between product cards and payment modal
  function handlePaying() {
    setPaying(false);
  }
  // callback to reload products
  function resetCount() {
    setCount(0);
  }

  // settings for products carousel
  var settings = {
    dots: true,
    infinite: false,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: activeProducts.length
  };
  let SliderWidth = "700px";
  let sliderMargin = 8;

  // reduces slides on mobile
  if (isTabletOrMobile == true) {
    settings.slidesToShow = 2;
    sliderMargin = 0;
    SliderWidth = "400px"
  }

  // columns for transactions table
  const columns = [
    { field: "_id", headerName: "ID", flex: 1 },
    { field: "Amount", headerName: "Amount", flex: 1 },
    { field: "Date", headerName: "Date", flex: 1 },
  ];

  // load transactions
  async function setTransactions(id) {
    setLoadingTransactions(true);
    let data = await getProductData(id);
    // console.log(id);
    // format date
    data.forEach((item) => {
      item.Date = formatDate(parseInt(item.Date));
      item.Amount = '₵' + String(prettifyNumber(item.Amount));
    });
    setTableData(data);
    setLoadingTransactions(false);
    // console.log(data);
  }

  // load products
  async function getActiveProducts() {
    const data = await fetch(
      process.env.REACT_APP_API_URL+`products/customer/${customer["_id"]}`
    );
    const data_1 = await data.json();
    let activeProductSort = [];
    data_1.forEach(async (element) => {
      // sort for only active products
      if (element["Request Status"] == "Approved" && element["Product Status"] == "Active") {
        activeProductSort.push(element);
      }
    });
    setActiveProducts(activeProductSort);
    // console.log(data_1);
  }

  useEffect(() => {
    if (count < 1) {
      getActiveProducts();
      setCount(1);
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Toaster />
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
                borderRadius: 14,
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
      {activeProducts?.length > 0 ? <div style={{ margin: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Your Active Products</h3>
        <div className="row-responsive">
          {paying ? <PaymentModal selectedCard={selectedCard} customer={customer} resetCount={resetCount} callback={handlePaying} />
            :
            <div style={{ width: SliderWidth }}>
              <Slider {...settings}>
                {activeProducts.map((item, index) => (
                  <div style={{ marginRight: sliderMargin }}>
                    <div
                      onClick={() => {
                        setSelectedCard(item);
                        setTransactions(item['_id']);
                      }}
                      className={item == selectedCard ? "card-item-selected" : "card-item"}>
                      <h4>{item["Product Category"]}</h4>
                      <p className="small-text">Loan Amount: ₵{prettifyNumber(item["Principal"] + item["Interest"])}</p>
                      <p className="small-text">Balance: ₵{prettifyNumber(item["Balance"])}</p>
                      <p onClick={(event) => {
                        // by stopping the click from leaking to the div, we can handle the click for paying first, then also set this as the clicked card
                        // if it had propagated, the onclick for pay would be ignored as the div would handle its click only
                        event.stopPropagation();
                        setSelectedCard(item);
                        setTransactions(item['_id']);
                        if (selectedCard["Balance"] == 0) {
                          toast("You don't have a balance to pay off.");
                        } else {
                          setPaying(true);
                        }
                      }}
                        className="small-text" style={{ background: "#87ceeb", color: "black", padding: "2px 4px", borderRadius: 8, cursor: "pointer" }}>Pay</p>
                    </div>
                  </div>

                ))}
              </Slider>
            </div>}
          <div className="float-right-preview">
            {selectedCard ?
              <div className="container-grey-bg">
                <div>
                  <PieChart
                    className="chart"
                    data={[
                      { value: (parseInt(selectedCard["Principal"]) + parseInt(selectedCard["Interest"])) - parseInt(selectedCard["Balance"]), color: "#2A2550" },
                      { value: parseInt(selectedCard.Balance), color: "#FF7700" },
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
                      <p className="principal">Balance</p>
                    </div>
                    <div>
                      <p className="interest">₵{prettifyNumber((selectedCard["Principal"] + selectedCard["Interest"]) - selectedCard["Balance"])}</p>
                      <p className="principal">₵{prettifyNumber(selectedCard["Balance"])}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p style={{ fontWeight: "bold" }}>Product ID</p>
                  <p>{selectedCard["Product ID"]}</p>
                  <p style={{ fontWeight: "bold" }}>Interest Charged</p>
                  <p>{(parseInt(selectedCard["Interest"]) / parseInt(selectedCard.Principal)) * 100}%</p>
                  <p style={{ fontWeight: "bold" }}>Installment Amount</p>
                  <p>₵{prettifyNumber(selectedCard["Installment Amount"])}</p>
                  <p>Paid back every {selectedCard["Repayment Frequency"]}</p>
                  <div style={{ maxWidth: 200, marginTop: 16, alignItems: 'flex-start' }} className="icon-text">
                    <InfoRounded style={{color: "#415a77"}}/>
                   {notToday(selectedCard?.["Active Date"]) ? <p style={{ color: '#415a77' }}>Your next payment of ₵{prettifyNumber(selectedCard["Installment Amount"])} is due {selectedCard["Repayment Frequency"] == 'week' ? nextPaymentDayOfWeek(selectedCard?.["Repayment Day of Week"]) : nextPaymentDayOfMonth(selectedCard?.["Repayment Day of Month"])} </p>
                  : <p style={{ color: '#415a77' }}> Your first payment will be due on {selectedCard["Repayment Frequency"] == 'week' ? getDay(selectedCard?.["Repayment Day of Week"]) : <>the {dateOrdinal(selectedCard?.["Repayment Day of Month"])} of next month.</>}</p>}
                  </div>

                </div>
              </div> :
              <p className="container-grey-bg">👋 Select a product to see more information.</p>}
          </div>
        </div>
        <div style={{ margin: 16, gap: 16 }}>
          <h4>Transaction History</h4>
          <div style={{ padding: 0 }} className="dashboard-top-bar">
            <p>Keep track of all your transactions</p>
            <Link className="dashheader" to="transactions" state={{ tableData }}>
              <Maximize2 />
            </Link>
          </div>
        </div>
        {loadingTransactions ? <BeatLoader /> :
          <DataGrid
            style={{ paddingLeft: 16, paddingRight: 16, height: 300 }}
            rows={tableData}
            columns={columns}
            getRowId={(row) => row._id}
            pageSize={12}
          />
        }

      </div>
        :
        <div style={{ padding: 16 }}>
          <div className="row" style={{ alignItems: 'baseline', margin: 0 }}>
            <Lottie animationData={welcome} style={{ maxHeight: "480px", maxWidth: "480px" }} />
          </div>
          <p>Welcome to Falcon! 🎉  Ready to get started? Try requesting a loan.</p>
          <p style={{ marginTop: 16 }}>Usually, information on your active products will show up here.</p>
        </div>
      }
    </div>
  );
}