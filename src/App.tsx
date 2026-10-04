import {useEffect,useState} from "react"; import {api} from "./services/api";
type Dashboard={customers:number;activeLoans:number;carsInInventory:number;carsSold:number;totalSales:number;totalInvestment:number;totalProfit:number};
const money=(v:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(v);
export default function App(){
 const [data,setData]=useState<Dashboard|null>(null);
 useEffect(()=>{api.get("/reports/dashboard").then(r=>setData(r.data.data)).catch(console.error)},[]);
 return <div className="app"><aside className="sidebar"><div className="brand">SM ASSOCIATE</div><nav>
 <div className="nav-title">GENERAL</div><a className="active">Dashboard</a>
 <div className="nav-title">LOAN MANAGEMENT</div><a>Loan Dashboard</a><a>Applications</a><a>Active Loans</a><a>Follow-ups</a>
 <div className="nav-title">CAR MANAGEMENT</div><a>Car Buying</a><a>Car Inventory</a><a>Car Sold</a><a>Expenses</a>
 <div className="nav-title">CUSTOMER MANAGEMENT</div><a>Customers</a><a>Customer History</a>
 <div className="nav-title">PROFIT & REPORTS</div><a>Car Profit</a><a>Loan Revenue</a><a>Reports</a></nav></aside>
 <main className="main"><header><h1>Dashboard</h1><p>SM Associate Management System</p></header>
 <section className="cards"><Card label="Total Customers" value={String(data?.customers??0)}/><Card label="Active Loans" value={String(data?.activeLoans??0)}/><Card label="Cars in Inventory" value={String(data?.carsInInventory??0)}/><Card label="Cars Sold" value={String(data?.carsSold??0)}/></section>
 <section className="profit-card"><div><span>Total Investment</span><strong>{money(data?.totalInvestment??0)}</strong></div><div><span>Total Sales</span><strong>{money(data?.totalSales??0)}</strong></div><div><span>Net Car Profit</span><strong>{money(data?.totalProfit??0)}</strong></div></section></main></div>
}
function Card({label,value}:{label:string;value:string}){return <div className="card"><span>{label}</span><strong>{value}</strong></div>}