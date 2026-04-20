# Live Portfolio (Event-Driven Edition)

## 1. Visão Geral
Um portfólio dinâmico que reflete suas atividades em tempo real, utilizando uma arquitetura baseada em eventos. O sistema consome dados do GitHub via Webhooks, processa-os de forma assíncrona utilizando Redis Streams e expõe uma interface de alta performance para recrutadores.

## 2. Pilares de Engenharia
- **Contexto, Spec e Validação:** Rigor técnico no tratamento de dados.
- **Event Sourcing (Light):** Desacoplamento entre a recepção do dado e a sua exibição.
- **Rastreabilidade:** Monitoramento de acessos por origem (LinkedIn, CV, etc.).

## 3. Stack Tecnológica (Definida)
- **Backend:** PHP 8.3 (Strict Types, Readonly Properties).
- **Runtime:** FrankenPHP.
- **Mensageria:** Upstash Redis (Streams).
- **Banco de Dados:** Supabase (PostgreSQL).
- **Cache/Projeção:** Upstash Redis.
- **Frontend:** Next.js (React) + Tailwind CSS.
- **Infraestrutura:** Docker & Docker Compose.

## 4. Roteiro de Execução
- **Etapa 1:** Fundação e Ingestão (Webhook GitHub -> Redis Stream). [EM ANDAMENTO]
- **Etapa 2:** Processamento e Regras de Negócio (Worker PHP).
- **Etapa 3:** Projeção e Persistência (PostgreSQL + Redis).
- **Etapa 4:** Frontend e Rastreabilidade (Next.js + Dashboard).

## 5. Endpoints e Rotas
- `POST /webhook/github`: Recebe os eventos (ponto de entrada da validação).
- `GET /`: O Portfólio Live (Next.js consumindo do Redis).
- `GET /stats`: Dados para o gráfico de habilidades.
- `GET /admin/tracking`: Dashboard privado de acessos.
