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

if [ ! -f back/.env ]; then
  echo "==> Criando back/.env a partir de back/.env.example"
  cp back/.env.example back/.env
  echo "    Ajuste DB_PASSWORD e JWT_SECRET em back/.env antes de produção."
fi

if [ ! -f front/.env ]; then
  echo "==> Criando front/.env a partir de front/.env.example"
  cp front/.env.example front/.env
fi

COMPOSE_ENV=(--env-file back/.env --env-file front/.env)

echo "==> Subindo containers (build + detach)..."
docker compose "${COMPOSE_ENV[@]}" up --build -d

echo "==> Aguardando Postgres ficar healthy..."
ATTEMPTS=0
until docker compose "${COMPOSE_ENV[@]}" exec -T postgres pg_isready -U "${DB_USERNAME:-postgres}" -d "${DB_DATABASE:-agendamento}" >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge 30 ]; then
    echo "Erro: Postgres não ficou pronto a tempo."
    docker compose "${COMPOSE_ENV[@]}" ps
    exit 1
  fi
  sleep 2
done

echo "==> Executando migrations (somente schema)..."
docker compose "${COMPOSE_ENV[@]}" exec -T back npm run migration:run

# shellcheck source=/dev/null
set -a
source back/.env
source front/.env
set +a

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
