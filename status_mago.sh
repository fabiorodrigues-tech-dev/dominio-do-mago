#!/bin/bash
# ==============================================================================
# Status do Domínio do Mago (Banco, Backend e Frontend)
# ==============================================================================

echo "🔮 Verificando estado dos feitiços do Domínio do Mago..."
echo ""

# 1. Banco de Dados (PostgreSQL 5432)
echo -n "1. PostgreSQL (5432): "
if docker ps 2>/dev/null | grep -q "nexuslife-db"; then
  echo "✅ ONLINE (Docker: nexuslife-db ativo)"
elif nc -z localhost 5432 2>/dev/null || lsof -i :5432 >/dev/null 2>&1; then
  echo "✅ ONLINE (Porta 5432 ativa)"
else
  echo "❌ OFFLINE (Execute 'docker compose up -d')"
fi

# 2. Backend (Spring Boot 8080)
echo -n "2. Backend Java (8080): "
BACK_PID=$(lsof -ti :8080)
if [ -n "$BACK_PID" ]; then
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/auth/login 2>/dev/null)
  if [ "$HTTP_STATUS" != "000" ]; then
    echo "✅ ONLINE (PID $BACK_PID - HTTP $HTTP_STATUS)"
  else
    echo "⚠️ INICIANDO (PID $BACK_PID ativo, aguardando porta liberar)"
  fi
else
  echo "❌ OFFLINE (Inicie com ./start_always_online.sh ou ./start_mago.sh)"
fi

# 3. Frontend (Next.js 3000)
echo -n "3. Frontend Next.js (3000): "
FRONT_PID=$(lsof -ti :3000)
if [ -n "$FRONT_PID" ]; then
  FRONT_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
  if [ "$FRONT_HTTP" = "200" ] || [ "$FRONT_HTTP" = "304" ]; then
    echo "✅ ONLINE (PID $FRONT_PID - HTTP $FRONT_HTTP)"
  else
    echo "⚠️ INICIANDO (PID $FRONT_PID ativo, compilando páginas)"
  fi
else
  echo "❌ OFFLINE (Inicie com cd frontend && npm run dev)"
fi

echo ""
echo "🌐 URL do Painel: http://localhost:3000"
echo "🌐 API REST:      http://localhost:8080/api"
