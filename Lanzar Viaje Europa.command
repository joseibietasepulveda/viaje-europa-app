#!/bin/zsh

set -e

PORT=5173
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
URL="http://127.0.0.1:${PORT}/"

cd "$APP_DIR"

echo "Viaje Europa app"
echo "Carpeta: $APP_DIR"
echo "Puerto: $PORT"
echo

PIDS="$(lsof -ti tcp:${PORT} || true)"
if [ -n "$PIDS" ]; then
  echo "Cerrando servicio previo en el puerto ${PORT}: $PIDS"
  echo "$PIDS" | xargs kill -9
  sleep 1
else
  echo "No habia ningun servicio corriendo en el puerto ${PORT}."
fi

echo "Abriendo ${URL}"
(sleep 2 && open "$URL") &

echo "Levantando servidor local..."
echo "Para detenerlo, cierra esta ventana o presiona Ctrl+C."
echo

npm run dev -- --host 127.0.0.1 --port "$PORT"
