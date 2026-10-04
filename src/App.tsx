import { FormEvent, useEffect, useState } from "react";
import { api } from "./services/api";

type User={id:string;name:string;email:string;role:"ADMIN"|"STAFF"};
type Customer={_id:string;customerId:string;name:string;mobile:string;email?:string;city?:string;occupation?:string};
type Loan={_id:string;loanId:string;customerId:Customer;loanType:string;requiredAmount:number;financeCompany?:string;status:string;commission:number};
type Car={_id:string;vehicleId:string;registrationNumber:string;make:string;model:string;year:number;ownerNumber:number;km:number;fuel:string;purchasePrice:number;status:string;sellerId?:Customer};
type Dashboard={customers:number;activeLoans:number;carsInInventory:number;carsSold:number;totalSales:number;totalInvestment:number;totalProfit:number};

const money=(v:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(v);
const nav=[["Dashboard","Dashboard"],["Loan Dashboard","Loans"],["Applications","Loans"],["Active Loans","Loans"],["Car Buying","Car Buying"],["Car Inventory","Cars"],["Car Sold","Sold"],["Expenses","Cars"],["Customers","Customers"],["Customer History","Customers"],["Car Profit","Profit"],["Loan Revenue","Loans"],["Reports","Dashboard"]];

export default function App(){
 const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{api.get("/auth/me").then(r=>setUser(r.data.data)).catch(()=>localStorage.removeItem("sm_token")).finally(()=>setLoading(false))},[]);
 if(loading)return <div className="center-page"><div className="loader-card">Loading SM Associate...</div></div>;
 if(!user)return <Login onLogin={setUser}/>;
 return <ManagementApp user={user} onLogout={()=>{localStorage.removeItem("sm_token");setUser(null)}}/>;
}

function Login({onLogin}:{onLogin:(u:User)=>void}){
 const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[error,setError]=useState("");const[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setError("");setBusy(true);try{const r=await api.post("/auth/login",{email,password});localStorage.setItem("sm_token",r.data.data.token);onLogin(r.data.data.user)}catch(e:any){setError(e?.response?.data?.message||"Unable to sign in. Please try again.")}finally{setBusy(false)}}
 return <div className="login-page"><div className="login-panel"><div className="login-brand">SM ASSOCIATE</div><h1>Management System</h1><p>Secure access for finance and car operations.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<div className="error-box">{error}</div>}<button className="primary-btn" disabled={busy}>{busy?"Signing in...":"Sign in"}</button></form></div></div>
}

function ManagementApp({user,onLogout}:{user:User;onLogout:()=>void}){
 const[page,setPage]=useState("Dashboard");
 return <div className="app"><aside className="sidebar"><div className="brand">SM ASSOCIATE</div><nav>
 <div className="nav-title">GENERAL</div><Nav label="Dashboard" page={page} setPage={setPage}/>
 <div className="nav-title">LOAN MANAGEMENT</div>{["Loan Dashboard","Applications","Active Loans","Follow-ups"].map(x=><Nav key={x} label={x} page={page} setPage={setPage}/>)}
 <div className="nav-title">CAR MANAGEMENT</div>{["Car Buying","Car Inventory","Car Sold","Expenses"].map(x=><Nav key={x} label={x} page={page} setPage={setPage}/>)}
 <div className="nav-title">CUSTOMER MANAGEMENT</div>{["Customers","Customer History"].map(x=><Nav key={x} label={x} page={page} setPage={setPage}/>)}
 <div className="nav-title">PROFIT & REPORTS</div>{["Car Profit","Loan Revenue","Reports"].map(x=><Nav key={x} label={x} page={page} setPage={setPage}/>)}</nav>
 <div className="sidebar-user"><strong>{user.name}</strong><span>{user.role}</span><button onClick={onLogout}>Sign out</button></div></aside>
 <main className="main"><header><div><h1>{page}</h1><p>SM Associate Management System</p></div><div className="user-pill">{user.name}</div></header><PageContent page={page}/></main></div>
}
function Nav({label,page,setPage}:{label:string;page:string;setPage:(x:string)=>void}){return <button className={page===label?"nav-link active":"nav-link"} onClick={()=>setPage(label)}>{label}</button>}

function PageContent({page}:{page:string}){
 if(page==="Customers"||page==="Customer History")return <CustomersPage historyOnly={page==="Customer History"}/>;
 if(page==="Loans"||page==="Loan Dashboard"||page==="Applications"||page==="Active Loans"||page==="Follow-ups"||page==="Loan Revenue")return <LoansPage filter={page}/>;
 if(page==="Cars"||page==="Car Inventory"||page==="Expenses"||page==="Car Profit")return <CarsPage mode={page}/>;
 if(page==="Car Buying")return <CarBuyingPage/>;
 if(page==="Car Sold")return <CarSoldPage/>;
 return <DashboardPage/>;
}

function DashboardPage(){
 const[data,setData]=useState<Dashboard|null>(null);const[error,setError]=useState("");
 useEffect(()=>{api.get("/reports/dashboard").then(r=>setData(r.data.data)).catch(e=>setError(e?.response?.data?.message||"Unable to load dashboard."))},[]);
 return <>{error&&<div className="error-box">{error}</div>}<section className="cards"><Card label="Total Customers" value={String(data?.customers??0)}/><Card label="Active Loans" value={String(data?.activeLoans??0)}/><Card label="Cars in Inventory" value={String(data?.carsInInventory??0)}/><Card label="Cars Sold" value={String(data?.carsSold??0)}/></section><section className="profit-card"><div><span>Total Investment</span><strong>{money(data?.totalInvestment??0)}</strong></div><div><span>Total Sales</span><strong>{money(data?.totalSales??0)}</strong></div><div><span>Net Car Profit</span><strong>{money(data?.totalProfit??0)}</strong></div></section></>;
}
function Card({label,value}:{label:string;value:string}){return <div className="card"><span>{label}</span><strong>{value}</strong></div>}

function CustomersPage({historyOnly}:{historyOnly:boolean}){
 const[customers,setCustomers]=useState<Customer[]>([]);const[search,setSearch]=useState("");const[form,setForm]=useState({name:"",mobile:"",email:"",city:"",occupation:""});const[message,setMessage]=useState("");
 const load=()=>api.get("/customers",{params:{search}}).then(r=>setCustomers(r.data.data)).catch(()=>setMessage("Unable to load customers."));
 useEffect(()=>{load()},[search]);
 async function add(e:FormEvent){e.preventDefault();setMessage("");try{await api.post("/customers",form);setForm({name:"",mobile:"",email:"",city:"",occupation:""});setMessage("Customer added successfully.");load()}catch(e:any){setMessage(e?.response?.data?.message||"Unable to save customer.")}}
 return <div className="module-grid"><section className="panel"><div className="panel-head"><div><h2>{historyOnly?"Customer History":"Customers"}</h2><p>Manage customer records and linked transactions.</p></div></div><input className="search" placeholder="Search name, mobile or customer ID..." value={search} onChange={e=>setSearch(e.target.value)}/><div className="table-wrap"><table><thead><tr><th>ID</th><th>Name</th><th>Mobile</th><th>City</th><th>Occupation</th></tr></thead><tbody>{customers.map(c=><tr key={c._id}><td>{c.customerId}</td><td>{c.name}</td><td>{c.mobile}</td><td>{c.city||"—"}</td><td>{c.occupation||"—"}</td></tr>)}{!customers.length&&<tr><td colSpan={5} className="empty">No customers found.</td></tr>}</tbody></table></div></section>{!historyOnly&&<section className="panel form-panel"><h2>Add Customer</h2><form onSubmit={add}>{["name","mobile","email","city","occupation"].map(k=><input key={k} placeholder={k[0].toUpperCase()+k.slice(1)} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required={k==="name"||k==="mobile"}/>)}{message&&<div className="success-box">{message}</div>}<button className="primary-btn">Save Customer</button></form></section>}</div>
}

function LoansPage({filter}:{filter:string}){
 const[loans,setLoans]=useState<Loan[]>([]);const[customers,setCustomers]=useState<Customer[]>([]);const[form,setForm]=useState({customerId:"",loanType:"Home Loan",requiredAmount:"",financeCompany:""});const[message,setMessage]=useState("");
 const load=()=>api.get("/loans",{params:{status:filter==="Active Loans"?"APPROVED":undefined}}).then(r=>setLoans(r.data.data));
 useEffect(()=>{load();api.get("/customers").then(r=>setCustomers(r.data.data))},[]);
 async function add(e:FormEvent){e.preventDefault();try{await api.post("/loans",{...form,requiredAmount:Number(form.requiredAmount)});setMessage("Loan application created.");setForm({customerId:"",loanType:"Home Loan",requiredAmount:"",financeCompany:""});load()}catch(e:any){setMessage(e?.response?.data?.message||"Unable to create loan.")}}
 return <div className="module-grid"><section className="panel"><div className="panel-head"><div><h2>Loan Applications</h2><p>{filter==="Follow-ups"?"Review current applications for follow-up.":"Track finance applications and status."}</p></div></div><div className="table-wrap"><table><thead><tr><th>ID</th><th>Customer</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead><tbody>{loans.map(l=><tr key={l._id}><td>{l.loanId}</td><td>{l.customerId?.name}</td><td>{l.loanType}</td><td>{money(l.requiredAmount)}</td><td><span className="status">{l.status}</span></td></tr>)}{!loans.length&&<tr><td colSpan={5} className="empty">No loan applications.</td></tr>}</tbody></table></div></section><section className="panel form-panel"><h2>New Loan</h2><form onSubmit={add}><select value={form.customerId} onChange={e=>setForm({...form,customerId:e.target.value})} required><option value="">Select customer</option>{customers.map(c=><option key={c._id} value={c._id}>{c.customerId} — {c.name}</option>)}</select><select value={form.loanType} onChange={e=>setForm({...form,loanType:e.target.value})}>{["Home Loan","Car Loan","Business Loan","Personal Loan"].map(x=><option key={x}>{x}</option>)}</select><input type="number" placeholder="Required amount" value={form.requiredAmount} onChange={e=>setForm({...form,requiredAmount:e.target.value})} required/><input placeholder="Finance company" value={form.financeCompany} onChange={e=>setForm({...form,financeCompany:e.target.value})}/>{message&&<div className="success-box">{message}</div>}<button className="primary-btn">Create Application</button></form></section></div>
}

function CarBuyingPage(){
 const[customers,setCustomers]=useState<Customer[]>([]);const[form,setForm]=useState({sellerId:"",registrationNumber:"",make:"",model:"",year:"",ownerNumber:"1",km:"",fuel:"Petrol",purchasePrice:""});const[message,setMessage]=useState("");
 useEffect(()=>{api.get("/customers").then(r=>setCustomers(r.data.data))},[]);
 async function add(e:FormEvent){e.preventDefault();try{await api.post("/cars",{...form,year:Number(form.year),ownerNumber:Number(form.ownerNumber),km:Number(form.km),purchasePrice:Number(form.purchasePrice)});setMessage("Car purchase recorded and added to inventory.");}catch(e:any){setMessage(e?.response?.data?.message||"Unable to record car purchase.")}}
 return <section className="panel narrow"><h2>Car Buying</h2><p>Record a vehicle purchase. Expenses and final profit are linked automatically.</p><form className="form-grid" onSubmit={add}><select value={form.sellerId} onChange={e=>setForm({...form,sellerId:e.target.value})} required><option value="">Select seller</option>{customers.map(c=><option key={c._id} value={c._id}>{c.customerId} — {c.name}</option>)}</select><input placeholder="Registration number" value={form.registrationNumber} onChange={e=>setForm({...form,registrationNumber:e.target.value})} required/><input placeholder="Make" value={form.make} onChange={e=>setForm({...form,make:e.target.value})} required/><input placeholder="Model" value={form.model} onChange={e=>setForm({...form,model:e.target.value})} required/><input type="number" placeholder="Year" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} required/><input type="number" placeholder="Owner number" value={form.ownerNumber} onChange={e=>setForm({...form,ownerNumber:e.target.value})}/><input type="number" placeholder="KM" value={form.km} onChange={e=>setForm({...form,km:e.target.value})} required/><select value={form.fuel} onChange={e=>setForm({...form,fuel:e.target.value})}>{["Petrol","Diesel","CNG","Electric","Hybrid"].map(x=><option key={x}>{x}</option>)}</select><input type="number" placeholder="Purchase price" value={form.purchasePrice} onChange={e=>setForm({...form,purchasePrice:e.target.value})} required/>{message&&<div className="success-box full">{message}</div>}<button className="primary-btn full">Record Purchase</button></form></section>
}

function CarsPage({mode}:{mode:string}){
 const[cars,setCars]=useState<Car[]>([]);const[message,setMessage]=useState("");
 const load=()=>api.get("/cars",{params:{status:mode==="Car Inventory"?"AVAILABLE":undefined}}).then(r=>setCars(r.data.data)).catch(()=>setMessage("Unable to load cars."));
 useEffect(()=>{load()},[mode]);
 async function addExpense(id:string){const amount=window.prompt("Expense amount");if(!amount)return;try{await api.post(`/cars/${id}/expenses`,{category:"General",amount:Number(amount),description:"Added from web"});setMessage("Expense added.");}catch(e:any){setMessage(e?.response?.data?.message||"Unable to add expense.")}}
 return <section className="panel"><div className="panel-head"><div><h2>{mode}</h2><p>Vehicles, investment and operating expenses.</p></div></div>{message&&<div className="success-box">{message}</div>}<div className="table-wrap"><table><thead><tr><th>Vehicle</th><th>Registration</th><th>Model</th><th>Purchase</th><th>Status</th>{mode==="Expenses"&&<th>Action</th>}</tr></thead><tbody>{cars.map(c=><tr key={c._id}><td>{c.vehicleId}</td><td>{c.registrationNumber}</td><td>{c.make} {c.model} ({c.year})</td><td>{money(c.purchasePrice)}</td><td><span className="status">{c.status}</span></td>{mode==="Expenses"&&<td><button className="small-btn" onClick={()=>addExpense(c._id)}>Add Expense</button></td>}</tr>)}{!cars.length&&<tr><td colSpan={6} className="empty">No vehicles found.</td></tr>}</tbody></table></div></section>
}

function CarSoldPage(){
 const[cars,setCars]=useState<Car[]>([]);const[customers,setCustomers]=useState<Customer[]>([]);const[carId,setCarId]=useState("");const[buyerId,setBuyerId]=useState("");const[price,setPrice]=useState("");const[expenses,setExpenses]=useState("0");const[message,setMessage]=useState("");
 useEffect(()=>{api.get("/cars",{params:{status:"AVAILABLE"}}).then(r=>setCars(r.data.data));api.get("/customers").then(r=>setCustomers(r.data.data))},[]);
 async function sell(e:FormEvent){e.preventDefault();try{const r=await api.post(`/cars/${carId}/sell`,{buyerId,sellingPrice:Number(price),sellingExpenses:Number(expenses)});setMessage(`Sold successfully. Net profit: ${money(r.data.data.profit)}`);setCars(cars.filter(c=>c._id!==carId));}catch(e:any){setMessage(e?.response?.data?.message||"Unable to complete sale.")}}
 return <section className="panel narrow"><h2>Car Sold</h2><p>Sell an inventory vehicle and calculate net profit automatically.</p><form onSubmit={sell}><select value={carId} onChange={e=>setCarId(e.target.value)} required><option value="">Select vehicle</option>{cars.map(c=><option key={c._id} value={c._id}>{c.vehicleId} — {c.registrationNumber} — {c.make} {c.model}</option>)}</select><select value={buyerId} onChange={e=>setBuyerId(e.target.value)} required><option value="">Select buyer</option>{customers.map(c=><option key={c._id} value={c._id}>{c.customerId} — {c.name}</option>)}</select><input type="number" placeholder="Selling price" value={price} onChange={e=>setPrice(e.target.value)} required/><input type="number" placeholder="Selling expenses" value={expenses} onChange={e=>setExpenses(e.target.value)}/>{message&&<div className="success-box">{message}</div>}<button className="primary-btn">Complete Sale</button></form></section>
}