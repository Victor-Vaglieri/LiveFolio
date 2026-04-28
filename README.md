# LiveFolio (Event-Driven Edition)

Este repositório contém o código-fonte de um portfólio dinâmico projetado para refletir atividades de desenvolvimento em tempo real, utilizando uma arquitetura orientada a eventos.

## 1. Visão Geral

O **LiveFolio** foi concebido para ir além de um portfólio estático. Ele atua como um sistema de monitoramento que ingere, processa e projeta eventos do ecossistema GitHub diretamente para uma interface de alta performance.

### Objetivos do Projeto
1.  **Rastreabilidade em Tempo Real:** Fornecer uma visão imediata de commits, pushes e atividades de repositórios via Webhooks.
2.  **Arquitetura de Event Sourcing (Light):** Implementar o desacoplamento entre a recepção do dado (Webhook) e a exibição final, garantindo integridade.
3.  **Performance Analytics:** Gerar estatísticas de produtividade e saúde do sistema de forma automática.

## 2. Ciclo de Desenvolvimento

O roteiro de execução segue as etapas de engenharia abaixo:

1.  **Fundação e Ingestão:** Implementação do endpoint de Webhook em PHP 8.3 para recepção de dados e publicação imediata em **Redis Streams**.
2.  **Processamento e Regras de Negócio:** Desenvolvimento de um Worker assíncrono para consumir, filtrar e transformar os eventos brutos.
3.  **Projeção e Persistência:** Sincronização dos dados processados em **PostgreSQL (Supabase)** para histórico e **Redis** para cache de baixa latência.
4.  **Interface de Visualização (Frontend):** Construção de um Dashboard em **Next.js** que consome as projeções e exibe métricas de telemetria.

## 3. Tecnologias e Ferramentas (Stack)

A escolha das tecnologias foi guiada por performance, tipagem rigorosa e escalabilidade:

*   **Backend (PHP 8.3):** Escolhido pela maturidade e pelas *Readonly Properties/Strict Types*, permitindo uma camada de domínio robusta.
*   **Runtime (FrankenPHP):** Utilizado para servir a aplicação PHP, aproveitando as capacidades do servidor Caddy integrado.
*   **Mensageria (Upstash Redis Streams):** Atua como o "log" de eventos, permitindo processamento assíncrono e persistência temporária de alta velocidade.
*   **Banco de Dados (Supabase/PostgreSQL):** Utilizado para a persistência relacional do histórico de eventos e configurações do sistema.
*   **Frontend (Next.js 14):** Escolhido pelo *Server-Side Rendering (SSR)*, garantindo que o portfólio carregue instantaneamente com dados pré-renderizados.
*   **Infraestrutura (Docker):** Todo o ecossistema (PHP, Worker, Frontend) é orquestrado via Docker para garantir paridade entre ambientes.

## 4. Estrutura do Projeto

```text
LiveFolio/
├── bin/                  # Scripts de execução (Workers e CLI)
├── frontend/             # Aplicação Next.js (Dashboard e UI)
│   ├── app/              # Rotas e Páginas (Next.js App Router)
│   └── lib/              # Clientes de Banco de Dados e Redis
├── public/               # Ponto de entrada do Webhook (PHP)
├── src/                  # Lógica de Core do Backend
│   ├── Messaging/        # Produtores e Consumidores de Eventos
│   ├── Persistence/      # Repositórios e Projeções (Supabase/Redis)
│   ├── Processing/       # Processadores de Regras de Negócio
│   └── Webhook/          # Handlers de validação do GitHub
└── tests/                # Scripts de validação e simulação de carga
```

## 5. Execução

### Pré-requisitos
*   **Docker & Docker Compose**
*   **Conta no Upstash** (para Redis) e **Supabase** (para PostgreSQL)
*   **GitHub Webhook Secret** configurado

### Passo a Passo

1.  **Configuração de Ambiente:**
    Clone o arquivo `.env.example` para `.env` e preencha com suas credenciais do Supabase, Redis e GitHub.

2.  **Build do Ecossistema:**
    ```bash
    docker-compose up -d --build
    ```

3.  **Inicialização do Banco:**
    O sistema criará as tabelas necessárias automaticamente no primeiro acesso ao Dashboard.

4.  **Importação Inicial (Opcional):**
    Para popular o portfólio com dados históricos antes do primeiro webhook:
    ```bash
    docker-compose exec php php bin/import_github.php
    ```
