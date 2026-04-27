#!/bin/sh

# Iniciar o worker em segundo plano
php bin/worker.php &

# Iniciar o FrankenPHP (Servidor Web)
exec frankenphp run --config /etc/caddy/Caddyfile
