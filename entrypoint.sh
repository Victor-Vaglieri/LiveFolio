#!/bin/sh

php bin/worker.php &

php bin/import_github.php &

export FRANKENPHP_HTTP_PORT=${PORT:-8080}

exec frankenphp php-server public/index.php
