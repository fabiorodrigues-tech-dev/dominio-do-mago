#!/bin/bash
# ==============================================================================
# Encerra os serviços do Domínio do Mago (Backend 8080 e Frontend 3000)
# ==============================================================================

echo "🛑 Encerrando serviços do Domínio do Mago..."

FRONT_PID=$(lsof -ti :3000)
if [ -n "$FRONT_PID" ]; then
  echo "Encerrando Frontend (PID $FRONT_PID na porta 3000)..."
  kill -9 $FRONT_PID 2>/dev/null
else
  echo "Frontend já não estava rodando."
fi

BACK_PID=$(lsof -ti :8080)
if [ -n "$BACK_PID" ]; then
  echo "Encerrando Backend (PID $BACK_PID na porta 8080)..."
  kill -9 $BACK_PID 2>/dev/null
else
  echo "Backend já não estava rodando."
fi

echo "✅ Serviços locais encerrados."
echo "Nota: O banco PostgreSQL Docker continua em execução. Para parar o banco, execute: docker compose stop"
