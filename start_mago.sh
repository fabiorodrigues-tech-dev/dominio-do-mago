#!/bin/bash
# ==============================================================================
# CONFIGURAÇÃO DE CHAVES DE API EXTERNAS:
# Para utilizar a geração real da Tripo3D na Forja do Avatar:
# 1. Obtenha a sua chave no painel do Tripo3D (https://platform.tripo3d.ai/)
# 2. Descomente a linha abaixo e insira o seu token OU exporte no seu ~/.zshrc:
#    export TRIPO3D_API_KEY="seu_token_aqui"
#
# (Se não definida, o sistema ativa o modo simulação mística com modelo padrão)
# ==============================================================================
# export TRIPO3D_API_KEY="seu_token_tripo3d_aqui"

echo "🔮 A conjurar o Domínio do Mago..."

cleanup() {
  echo ""
  echo "🛑 A encerrar os feitiços do Domínio do Mago..."
  if [ -n "$SPRING_PID" ]; then
    kill "$SPRING_PID" 2>/dev/null
  fi
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "1. A iniciar o Cofre (Docker PostgreSQL)..."
if command -v docker-compose &> /dev/null; then
  docker-compose up -d
elif command -v docker &> /dev/null; then
  docker compose up -d
else
  echo "⚠️ Aviso: docker-compose não encontrado no PATH atual. Certifique-se de que o PostgreSQL está rodando."
fi

echo "2. A verificar portas 8080 e 3000..."
OLD_PID=$(lsof -ti :8080)
if [ -n "$OLD_PID" ]; then
  echo "Liberando porta 8080 do processo anterior (PID $OLD_PID)..."
  kill -9 $OLD_PID 2>/dev/null
fi
OLD_FRONTEND_PID=$(lsof -ti :3000)
if [ -n "$OLD_FRONTEND_PID" ]; then
  echo "Liberando porta 3000 do processo anterior (PID $OLD_FRONTEND_PID)..."
  kill -9 $OLD_FRONTEND_PID 2>/dev/null
fi
rm -rf frontend/.next

echo "2.5. A extrair a Chave da Tripo3D..."
if [ -z "$TRIPO3D_API_KEY" ]; then
  TRIPO_CONFIG="$HOME/.tripo/config.json"
  if [ -f "$TRIPO_CONFIG" ]; then
    if command -v python3 &> /dev/null; then
      EXTRACTED_KEY=$(python3 -c "import json; d=json.load(open('$TRIPO_CONFIG')); print(d.get('profiles',{}).get(d.get('active_profile','default'),{}).get('api_key') or d.get('api_key') or d.get('apiKey') or '')" 2>/dev/null)
    elif command -v node &> /dev/null; then
      EXTRACTED_KEY=$(node -e "const d=require('$TRIPO_CONFIG'); console.log(d?.profiles?.[d?.active_profile]?.api_key || d?.api_key || d?.apiKey || '');" 2>/dev/null)
    else
      EXTRACTED_KEY=$(grep -Eo '"(api_key|apiKey)": *"[^"]*"' "$TRIPO_CONFIG" | head -n 1 | sed -E 's/.*"([^"]+)"$/\1/')
    fi

    if [ -n "$EXTRACTED_KEY" ]; then
      export TRIPO3D_API_KEY="$EXTRACTED_KEY"
      echo "✨ Chave da Tripo3D carregada com sucesso a partir de ~/.tripo/config.json"
    else
      echo "⚠️ AVISO: Não foi possível extrair a chave do arquivo ~/.tripo/config.json."
    fi
  else
    echo "⚠️ AVISO: Configuração da Tripo3D não encontrada em ~/.tripo/config.json. Execute 'tripo login'."
  fi
else
  echo "✨ Chave da Tripo3D já configurada no ambiente."
fi

echo "2.8. A verificar modelo 3D do Mago..."
if [ ! -f "frontend/public/avatar_fabio.glb" ]; then
  echo "📥 A descarregar o modelo 3D do Mago para frontend/public/avatar_fabio.glb..."
  mkdir -p frontend/public
  curl -s -L -o frontend/public/avatar_fabio.glb "https://raw.githubusercontent.com/DarkRewar/SurvivorsStarterKit/main/addons/kaykit_characters/Mage.glb"
fi

echo "2.9. A carregar variáveis de ambiente (.env)..."
if [ -f .env ]; then
  set -a
  source .env
  set +a
  echo "✨ Variáveis do .env carregadas com sucesso!"
elif [ -f src/main/resources/.env ]; then
  set -a
  source src/main/resources/.env
  set +a
  echo "✨ Variáveis do src/main/resources/.env carregadas com sucesso!"
fi

echo "3. A compilar e iniciar o Cérebro (Spring Boot)..."
mvn clean spring-boot:run &
SPRING_PID=$!

echo "Aguardando o backend responder..."
for i in {1..30}; do
  if curl -s http://localhost:8080/api/auth/login &> /dev/null; then
    echo "✨ Backend online e responsivo!"
    break
  fi
  sleep 1
done

echo "4. A preparar a Magia Visual (Next.js)..."
cd frontend
npm install
npm run dev
