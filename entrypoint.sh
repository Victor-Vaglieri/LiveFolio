#!/bin/sh

# Iniciar o worker em segundo plano
php bin/worker.php &

# Definir a porta para o FrankenPHP (O Render passa a porta na variável $PORT)
export FRANKENPHP_HTTP_PORT=${PORT:-8080}

# Iniciar o servidor
exec frankenphp php-server public/index.php
