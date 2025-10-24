Porto Verde Inteligente — Protótipo
Como executar:
1. Criar venv e instalar dependências:
   python -m venv venv
   source venv/bin/activate
   pip install flask flask_cors

2. Executar:
   python app.py

3. Abrir no navegador:
   http://localhost:5000/

O endpoint /api/sensors retorna leituras simuladas. /api/simulate_event dispara um evento crítico no Sensor B.
