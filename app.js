const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
let stream=null;
const defaultForecast=[
 {day:"Today",icon:"⛅",high:72,low:61,condition:"Partly Cloudy"},
 {day:"Tomorrow",icon:"☀️",high:76,low:63,condition:"Sunny"},
 {day:"Wednesday",icon:"🌧️",high:70,low:59,condition:"Rain"},
 {day:"Thursday",icon:"⛈️",high:68,low:57,condition:"Storms"},
 {day:"Friday",icon:"☀️",high:74,low:58,condition:"Sunny"},
 {day:"Saturday",icon:"⛅",high:77,low:62,condition:"Partly Cloudy"},
 {day:"Sunday",icon:"🌤️",high:79,low:64,condition:"Mostly Sunny"}
];
const state={location:"Your City",temp:72,condition:"Partly Cloudy",icon:"⛅",accent:"#49a6ff",opacity:92,position:"bottom",logo:null,forecast:defaultForecast,forecastMode:"week",daysShown:7};

function renderForecastRows(){
  const box=$("#forecastRows"); if(!box)return;
  box.innerHTML="";
  state.forecast.forEach((d,i)=>{
    const row=document.createElement("div"); row.className="forecast-row";
    row.innerHTML=`
      <label>Day<input data-i="${i}" data-k="day" value="${d.day}"></label>
      <label>Icon<select data-i="${i}" data-k="icon">
        ${["☀️","🌤️","⛅","🌧️","⛈️","❄️","🌫️"].map(x=>`<option ${x===d.icon?"selected":""}>${x}</option>`).join("")}
      </select></label>
      <label>High °F<input type="number" data-i="${i}" data-k="high" value="${d.high}"></label>
      <label>Low °F<input type="number" data-i="${i}" data-k="low" value="${d.low}"></label>
      <label>Condition<input data-i="${i}" data-k="condition" value="${d.condition}"></label>`;
    box.appendChild(row);
  });
  box.querySelectorAll("input,select").forEach(el=>el.oninput=()=>{
    const i=Number(el.dataset.i),k=el.dataset.k;
    state.forecast[i][k]=(k==="high"||k==="low")?Number(el.value):el.value;
    renderForecastPreview(); renderWeekOverlay();
  });
}
function renderForecastPreview(){
  const box=$("#forecastPreview");if(!box)return;
  const n=Math.max(1,Math.min(7,Number($("#daysShown")?.value||state.daysShown)));
  box.innerHTML=state.forecast.slice(0,n).map(d=>`
    <div class="forecast-day"><div class="day">${d.day}</div><div class="ficon">${d.icon}</div>
    <div class="temps">${d.high}° / ${d.low}°</div><small>${d.condition}</small></div>`).join("");
}
function renderWeekOverlay(){
  const box=$("#weekOverlay");if(!box)return;
  const mode=state.forecastMode||"week",n=Math.max(1,Math.min(7,Number(state.daysShown||7)));
  box.style.display=mode==="current"?"none":"grid";
  box.style.gridTemplateColumns=`repeat(${Math.min(n,7)},1fr)`;
  box.innerHTML=state.forecast.slice(0,n).map(d=>`
    <div class="week-tile"><div class="wday">${d.day}</div><div class="wicon">${d.icon}</div>
    <div class="wtemp">${d.high}°</div><div class="wlow">${d.low}°</div></div>`).join("");
}
function applyForecastSettings(){
  state.forecastMode=$("#forecastMode").value;
  state.daysShown=Math.max(1,Math.min(7,Number($("#daysShown").value)||7));
  state.accent=$("#accentInput").value;state.opacity=Number($("#opacityInput").value);state.position=$("#positionInput").value;
  save();render();renderForecastPreview();renderWeekOverlay();
}
function load(){try{Object.assign(state,JSON.parse(localStorage.getItem("weatherStudio")||"{}"))}catch{};if(!Array.isArray(state.forecast)||state.forecast.length<7)state.forecast=defaultForecast;render();}
function save(){localStorage.setItem("weatherStudio",JSON.stringify(state));}
function render(){
  $("#locationInput").value=state.location;$("#tempInput").value=state.temp;$("#conditionInput").value=state.condition;$("#iconInput").value=state.icon;
  $("#accentInput").value=state.accent;$("#opacityInput").value=state.opacity;$("#positionInput").value=state.position;
  if($("#forecastMode"))$("#forecastMode").value=state.forecastMode||"week";
  if($("#daysShown"))$("#daysShown").value=state.daysShown||7;
  $("#overlayLocation").textContent=state.location.toUpperCase();$("#overlayTemp").textContent=state.temp+"°";$("#overlayCondition").textContent=state.condition;
  $("#cardLocation").textContent=state.location;$("#cardTemp").textContent=state.temp+"°F";$("#cardCondition").textContent=state.condition;$("#weatherIcon").textContent=state.icon;
  $(".weather-overlay").style.borderLeftColor=state.accent;$(".weather-overlay").style.background=`rgba(8,13,21,${state.opacity/100})`;$(".weather-overlay").classList.toggle("top",state.position==="top");
  renderForecastRows();renderForecastPreview();renderWeekOverlay();
  if(state.logo){$("#previewLogo").src=state.logo;$("#previewLogo").style.display="block";$("#logoPreview").src=state.logo;$("#logoPreview").style.display="block";$("#logoEmpty").style.display="none"}
}
function switchTab(id){$$(".tab").forEach(x=>x.classList.toggle("hidden",x.id!==id));$$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.tab===id))}
$$(".nav").forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
function setVideo(v,on){if(stream){v.srcObject=stream;v.classList.toggle("on",on)}else v.classList.remove("on")}
async function startCamera(){
 try{
  const w=Number($("#resolutionSelect").value.split("x")[0]),h=Number($("#resolutionSelect").value.split("x")[1]);
  stream=await navigator.mediaDevices.getUserMedia({video:{deviceId:$("#cameraSelect").value?{exact:$("#cameraSelect").value}:undefined,width:{ideal:w},height:{ideal:h}},audio:$("#micSelect").value?{deviceId:{exact:$("#micSelect").value}}:true});
  setVideo($("#cameraVideo"),true);setVideo($("#cameraPreview"),true);
  $("#cameraPlaceholder").style.display="none";$("#stagePlaceholder").style.display="none";$("#cameraStatus").textContent="CAMERA LIVE";$("#statCamera").textContent="LIVE";
 }catch(e){alert("Camera access failed. Make sure the page is HTTPS (or localhost) and allow camera access.")}
}
function stopCamera(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}[$("#cameraVideo"),$("#cameraPreview")].forEach(v=>{v.srcObject=null;v.classList.remove("on")});$("#cameraPlaceholder").style.display="grid";$("#stagePlaceholder").style.display="grid";$("#cameraStatus").textContent="CAMERA OFF";$("#statCamera").textContent="OFF"}
$("#startCamera").onclick=startCamera;$("#cameraStart2").onclick=startCamera;$("#stopCamera").onclick=stopCamera;$("#cameraStop2").onclick=stopCamera;
async function devices(){if(!navigator.mediaDevices?.enumerateDevices)return;try{const d=await navigator.mediaDevices.enumerateDevices();$("#cameraSelect").innerHTML='<option value="">Default camera</option>';$("#micSelect").innerHTML='<option value="">Default microphone</option>';d.forEach(x=>{if(x.kind==="videoinput")$("#cameraSelect").innerHTML+=`<option value="${x.deviceId}">${x.label||"Camera"}</option>`;if(x.kind==="audioinput")$("#micSelect").innerHTML+=`<option value="${x.deviceId}">${x.label||"Microphone"}</option>`})}catch{}}
function apply(){state.location=$("#locationInput").value||"Your City";state.temp=Number($("#tempInput").value)||72;state.condition=$("#conditionInput").value||"Clear";state.icon=$("#iconInput").value;state.accent=$("#accentInput").value;state.opacity=Number($("#opacityInput").value);state.position=$("#positionInput").value;save();render()}
$("#applyWeather").onclick=()=>{apply();renderWeekOverlay()};
$("#updateGraphic").onclick=()=>{$(".weather-overlay").style.display="block";apply();renderWeekOverlay()};
$("#applyForecast").onclick=applyForecastSettings;
$("#forecastMode").onchange=applyForecastSettings;
$("#daysShown").oninput=()=>{state.daysShown=Number($("#daysShown").value)||7;renderForecastPreview();renderWeekOverlay();};
$("#clearGraphic").onclick=()=>{$(".weather-overlay").style.display="none";$("#weekOverlay").style.display="none"};
$("#randomWeather").onclick=()=>{const x=[["72","Partly Cloudy","⛅"],["84","Sunny","☀️"],["68","Rain","🌧️"],["61","Thunderstorm","⛈️"],["39","Snow","❄️"]][Math.floor(Math.random()*5)];$("#tempInput").value=x[0];$("#conditionInput").value=x[1];$("#iconInput").value=x[2];apply()};
$("#accentInput").oninput=()=>{state.accent=$("#accentInput").value;renderForecastPreview();renderWeekOverlay()};$("#opacityInput").oninput=()=>{state.opacity=Number($("#opacityInput").value);render()};$("#positionInput").onchange=()=>{state.position=$("#positionInput").value;render()};
$("#logoUpload").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{state.logo=r.result;save();render()};r.readAsDataURL(f)};
$("#iconUpload").onchange=e=>{const list=$("#iconList");list.innerHTML="";[...e.target.files].forEach(f=>{const r=new FileReader();r.onload=()=>{const i=document.createElement("img");i.src=r.result;i.title=f.name;list.appendChild(i)};r.readAsDataURL(f)})};
$("#saveBtn").onclick=()=>{apply();$("#saveBtn").textContent="Saved ✓";setTimeout(()=>$("#saveBtn").textContent="Save setup",1200)};
$("#fullscreenBtn").onclick=()=>document.documentElement.requestFullscreen?.();
$("#pageUrl").value=location.href;$("#copyUrl").onclick=()=>navigator.clipboard?.writeText(location.href);
function clock(){const d=new Date();$("#clock").textContent=d.toLocaleTimeString()}setInterval(clock,1000);clock();
navigator.mediaDevices?.addEventListener?.("devicechange",devices);load();devices();
