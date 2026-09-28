#!/bin/bash
# ==============================================================================
# Inicia todos os serviços do Domínio do Mago em segundo plano (Always Online)
# Os serviços continuam rodando mesmo fechando o terminal.
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

mkdir -p logs

echo "🔮 Iniciando o Domínio do Mago no modo Always Online..."

# 1. Banco de Dados
echo "1. Verificando PostgreSQL (Docker)..."
if ! docker ps 2>/dev/null | grep -q "nexuslife-db"; then
  echo "   Iniciando container nexuslife-db..."
  if command -v docker-compose &> /dev/null; then
    docker-compose up -d
  else
    docker compose up -d
  fi
  sleep 2
else
  echo "   PostgreSQL já está ativo."
fi

# 2. Carregar variáveis do .env se existir
if [ -f .env ]; then
  set -a
  source .env
  set +a
elif [ -f src/main/resources/.env ]; then
  set -a
  source src/main/resources/.env
  set +a
fi

# 3. Backend Java (Spring Boot)
echo "2. Verificando Backend Spring Boot (8080)..."
BACK_PID=$(lsof -ti :8080)
if [ -z "$BACK_PID" ]; then
  echo "   Iniciando Backend em background (logs em logs/backend.log)..."
  nohup mvn spring-boot:run > logs/backend.log 2>&1 &
  NEW_BACK_PID=$!
  echo "   PID iniciado: $NEW_BACK_PID. Aguardando inicialização..."
  for i in {1..35}; do
    if curl -s http://localhost:8080/api/auth/login &> /dev/null; then
      echo "   ✨ Backend online na porta 8080!"
      break
    fi
    sleep 1
  done
else
  echo "   Backend já está rodando (PID $BACK_PID)."
fi

# 4. Frontend Next.js
echo "3. Verificando Frontend Next.js (3000)..."
FRONT_PID=$(lsof -ti :3000)
if [ -z "$FRONT_PID" ]; then
  echo "   Iniciando Frontend em background (logs em logs/frontend.log)..."
  cd frontend
  nohup npm run dev > ../logs/frontend.log 2>&1 &
  NEW_FRONT_PID=$!
  cd ..
  echo "   PID iniciado: $NEW_FRONT_PID. Aguardando inicialização..."
  for i in {1..20}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "304" ]; then
      echo "   ✨ Frontend online na porta 3000!"
      break
    fi
    sleep 1
  done
else
  echo "   Frontend já está rodando (PID $FRONT_PID)."
fi

echo ""
"$PROJECT_ROOT/status_mago.sh"
