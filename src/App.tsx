import { FormEvent, useEffect, useState } from "react";
import { api } from "./services/api";

type User={id:string;name:string;email:string;role:"ADMIN"|"STAFF"};
type Dashboard={customers:number;activeLoans:number;carsInInventory:number;carsSold:number;totalSales:number;totalInvestment:number;totalProfit:number};
const money=(v:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(v);

export default function App(){
 const [user,setUser]=useState<User|null>(null);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{api.get("/auth/me").then(r=>setUser(r.data.data)).catch(()=>localStorage.removeItem("sm_token")).finally(()=>setLoading(false))},[]);
 if(loading)return <div className="center-page"><div className="loader-card">Loading SM Associate...</div></div>;
 if(!user)return <Login onLogin={setUser}/>;
 return <DashboardPage user={user} onLogout={()=>{localStorage.removeItem("sm_token");setUser(null)}}/>;
}

function Login({onLogin}:{onLogin:(user:User)=>void}){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setError("");setBusy(true);try{const r=await api.post("/auth/login",{email,password});localStorage.setItem("sm_token",r.data.data.token);onLogin(r.data.data.user)}catch(err:any){setError(err?.response?.data?.message||"Unable to sign in. Please try again.")}finally{setBusy(false)}}
 return <div className="login-page"><div className="login-panel"><div className="login-brand">SM ASSOCIATE</div><h1>Management System</h1><p>Secure access for finance and car operations.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/></label>{error&&<div className="error-box">{error}</div>}<button className="primary-btn" disabled={busy}>{busy?"Signing in...":"Sign in"}</button></form></div></div>
}

function DashboardPage({user,onLogout}:{user:User;onLogout:()=>void}){
 const [data,setData]=useState<Dashboard|null>(null); const [error,setError]=useState("");
 useEffect(()=>{api.get("/reports/dashboard").then(r=>setData(r.data.data)).catch(e=>setError(e?.response?.data?.message||"Unable to load dashboard."))},[]);
 return <div className="app"><aside className="sidebar"><div className="brand">SM ASSOCIATE</div><nav>
 <div className="nav-title">GENERAL</div><a className="active">Dashboard</a>
 <div className="nav-title">LOAN MANAGEMENT</div><a>Loan Dashboard</a><a>Applications</a><a>Active Loans</a><a>Follow-ups</a>
 <div className="nav-title">CAR MANAGEMENT</div><a>Car Buying</a><a>Car Inventory</a><a>Car Sold</a><a>Expenses</a>
 <div className="nav-title">CUSTOMER MANAGEMENT</div><a>Customers</a><a>Customer History</a>
 <div className="nav-title">PROFIT & REPORTS</div><a>Car Profit</a><a>Loan Revenue</a><a>Reports</a></nav><div className="sidebar-user"><strong>{user.name}</strong><span>{user.role}</span><button onClick={onLogout}>Sign out</button></div></aside>
 <main className="main"><header><div><h1>Dashboard</h1><p>SM Associate Management System</p></div><div className="user-pill">{user.name}</div></header>{error&&<div className="error-box">{error}</div>}
 <section className="cards"><Card label="Total Customers" value={String(data?.customers??0)}/><Card label="Active Loans" value={String(data?.activeLoans??0)}/><Card label="Cars in Inventory" value={String(data?.carsInInventory??0)}/><Card label="Cars Sold" value={String(data?.carsSold??0)}/></section>
 <section className="profit-card"><div><span>Total Investment</span><strong>{money(data?.totalInvestment??0)}</strong></div><div><span>Total Sales</span><strong>{money(data?.totalSales??0)}</strong></div><div><span>Net Car Profit</span><strong>{money(data?.totalProfit??0)}</strong></div></section></main></div>
}
function Card({label,value}:{label:string;value:string}){return <div className="card"><span>{label}</span><strong>{value}</strong></div>}