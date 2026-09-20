# Integração Domínio do Mago: Quickstart (Guia Prático)

Este guia prático ensina a subir todos os 3 pilares do **Domínio do Mago** (Banco, Backend e Frontend) em 3 comandos rápidos.

## Passo 1: Infraestrutura (PostgreSQL + pgvector)

Na raiz do projeto (`/Dominio-do-mago`), levante o contêiner Docker configurado no `docker-compose.yml`. Ele já inclui a extensão `vector` vital para a nossa Inteligência Artificial:

```bash
docker-compose up -d
```
*(O banco ficará acessível na porta 5432 com user: nexus e pass: nexus123).*

---

## Passo 2: Backend (Java 21 + Spring Boot + Spring AI)

Acesse o diretório raiz do projeto. Como nosso sistema usa a OpenAI para pensar, você precisa fornecer a sua chave na mesma linha em que inicia a aplicação para que o Spring Boot a capture na inicialização.

Substitua `sua_chave_aqui` pela sua chave real da OpenAI e rode:

```bash
export OPENAI_API_KEY=sua_chave_aqui && mvn spring-boot:run
```
*(O Spring Boot vai inicializar na porta 8080, o Flyway rodará as migrations para criar a tabela `ai_tasks` automaticamente).*

---

## Passo 3: Frontend Gamificado (Next.js + React Three Fiber)

Abra **outra aba do terminal**, entre na pasta `frontend`, instale os pacotes gerados no `package.json` e levante o servidor de desenvolvimento. O arquivo `.env.local` já foi configurado para bater na porta 8080 do backend.

```bash
cd frontend
npm install
npm run dev
```
*(O Next.js inicializará na porta 3000).*

---

## Validação da Integração

1. Acesse `http://localhost:3000` no navegador.
2. O Dashboard Domínio do Mago vai carregar com as barras de progresso vindas diretamente da nossa nova API Java (`GET /api/users/{id}/dashboard`).
3. No painel de Chat da Esquerda, digite *"Estudar para o exame de certificação amanhã"* e envie. 
4. Assista a magia acontecer: O React vai acionar o Controller Java, que vai rotear pro Spring AI, que vai classificar a frase e ativar o **Conselheiro**, gravando autonomamente a tarefa no banco via *Function Calling* e devolvendo uma mensagem de encorajamento na tela!
