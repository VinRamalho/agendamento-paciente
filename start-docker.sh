#!/usr/bin/env bash
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Agendamento Odontológico — inicialização via Docker"

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

if ! command -v docker >/dev/null 2>&1; then
  echo "Erro: Docker não encontrado. Instale o Docker Desktop e tente novamente."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Erro: Docker Compose não disponível."
  exit 1
fi

if [ ! -f .env ]; then
  echo "==> Criando .env a partir de .env.example"
  cp .env.example .env
  echo "    Ajuste DB_PASSWORD e JWT_SECRET no arquivo .env antes de produção."
fi

if [ ! -f back/.env ]; then
  echo "==> Criando back/.env a partir de .env"
  cp .env back/.env
fi

echo "==> Subindo containers (build + detach)..."
docker compose up --build -d

echo "==> Aguardando Postgres ficar healthy..."
ATTEMPTS=0
until docker compose exec -T postgres pg_isready -U "${DB_USERNAME:-postgres}" -d "${DB_DATABASE:-agendamento}" >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge 30 ]; then
    echo "Erro: Postgres não ficou pronto a tempo."
    docker compose ps
    exit 1
  fi
  sleep 2
done

echo "==> Executando migrations (somente schema)..."
docker compose exec -T back npm run migration:run

echo ""
echo "==> Aplicação iniciada com sucesso!"
echo "    Frontend : http://localhost:${FRONT_PORT:-3000}"
echo "    API      : http://localhost:${BACK_PORT:-3333}/api"
echo "    Swagger  : http://localhost:${BACK_PORT:-3333}/api/docs"
echo "    Health   : http://localhost:${BACK_PORT:-3333}/api/health"
echo "    Postgres : localhost:${DB_PORT:-5432}"
echo ""
echo "    Banco limpo (só tabelas). Para criar o admin opcional:"
echo "      docker compose exec back npm run seed"
echo "      Login: admin@agendamento.local / Admin@123"
echo ""
echo "    Logs     : docker compose logs -f"
echo "    Parar    : docker compose down"
