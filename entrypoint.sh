#!/bin/sh

# Iniciar o worker em segundo plano
php bin/worker.php &

# Iniciar o servidor usando a porta fornecida pelo Render (ou 8080 como fallback)
# Usamos 'php-server' que é mais leve e flexível para ambientes de nuvem
exec frankenphp php-server --port ${PORT:-8080}
