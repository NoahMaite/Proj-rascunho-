from flask import Flask, jsonify, render_template
from flask_cors import CORS
import threading, time, random

app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

# Simulated sensors store
SENSORS = [
    {"id": 1, "name": "Alemoa - Sensor A", "lat": -23.964, "lon": -46.328, "pm25": 12.0, "noise": 55},
    {"id": 2, "name": "Paquetá - Sensor B", "lat": -23.965, "lon": -46.332, "pm25": 18.0, "noise": 60},
    {"id": 3, "name": "Cais Norte - Sensor C", "lat": -23.958, "lon": -46.330, "pm25": 9.0, "noise": 52},
]

def sensor_simulator():
    while True:
        for s in SENSORS:
            # small random walk
            s['pm25'] = max(0, s['pm25'] + random.uniform(-1.5, 2.0))
            s['noise'] = max(30, s['noise'] + random.uniform(-2, 2))
        time.sleep(3)

@app.route("/api/sensors")
def api_sensors():
    # Add status derived from pm25
    out = []
    for s in SENSORS:
        status = "OK"
        if s['pm25'] >= 35 or s['noise'] >= 85:
            status = "CRÍTICO"
        elif s['pm25'] >= 12 or s['noise'] >= 70:
            status = "ATENÇÃO"
        out.append({
            "id": s["id"],
            "name": s["name"],
            "lat": s["lat"],
            "lon": s["lon"],
            "pm25": round(s["pm25"], 2),
            "noise": int(s["noise"]),
            "status": status
        })
    return jsonify({"sensors": out})

@app.route("/api/simulate_event")
def api_simulate_event():
    # make sensor 2 spike
    SENSORS[1]['pm25'] += 60
    SENSORS[1]['noise'] += 30
    return jsonify({"ok": True, "message": "Evento simulado: Sensor B em CRÍTICO"})

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    # Start simulator thread
    th = threading.Thread(target=sensor_simulator, daemon=True)
    th.start()
    app.run(host="0.0.0.0", port=5000, debug=True)
