const api = "/api/sensors";
const cardsEl = document.getElementById("cards");
const lastUpdate = document.getElementById("last-update");
const btnSimulate = document.getElementById("btn-simulate");
const sensorSelect = document.getElementById("sensor-select");
const ctx = document.getElementById("pmChart").getContext("2d");

let pmHistory = {}; // id -> array
let sensors = [];

function fetchSensors(){
  fetch(api).then(r => r.json()).then(data => {
    sensors = data.sensors;
    renderCards(sensors);
    updateSelect(sensors);
    lastUpdate.innerText = "Última atualização: " + new Date().toLocaleTimeString();
    sensors.forEach(s => {
      if(!pmHistory[s.id]) pmHistory[s.id] = [];
      pmHistory[s.id].push({t: Date.now(), val: s.pm25});
      if(pmHistory[s.id].length > 40) pmHistory[s.id].shift();
    });
    drawChart();
  }).catch(e => console.error(e));
}

function renderCards(list){
  cardsEl.innerHTML = "";
  list.forEach(s => {
    const div = document.createElement("div");
    div.className = "card " + s.status;
    div.innerHTML = `<strong>${s.name}</strong><div>PM2.5: ${s.pm25} µg/m³</div><div>Ruído: ${s.noise} dB</div><div>Status: ${s.status}</div>`;
    cardsEl.appendChild(div);
  });
}

btnSimulate.addEventListener("click", () => {
  fetch("/api/simulate_event").then(r => r.json()).then(()=> {
    setTimeout(fetchSensors, 1000);
  });
});

function updateSelect(list){
  if(sensorSelect.options.length === 0){
    list.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.text = s.name;
      sensorSelect.appendChild(opt);
    });
    sensorSelect.addEventListener("change", drawChart);
  }
}

function drawChart(){
  const id = parseInt(sensorSelect.value || sensors[0].id);
  const history = pmHistory[id] || [];
  const labels = history.map(h => new Date(h.t).toLocaleTimeString());
  const data = history.map(h => h.val);
  // simple canvas chart (no libs) — draw lines
  const canvas = document.getElementById("pmChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.beginPath();
  if(data.length===0) return;
  const maxv = Math.max(...data, 50);
  const minv = Math.min(...data, 0);
  data.forEach((v,i)=>{
    const x = (i/(data.length-1 || 1))*(canvas.width-40)+20;
    const y = canvas.height - 20 - ((v-minv)/(maxv-minv || 1))*(canvas.height-40);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.strokeStyle = "#0c6b3a";
  ctx.lineWidth = 2;
  ctx.stroke();

  // labels
  ctx.fillStyle = "#333";
  ctx.fillText("PM2.5 (µg/m³)", 10, 12);
}

setInterval(fetchSensors, 3000);
fetchSensors();
