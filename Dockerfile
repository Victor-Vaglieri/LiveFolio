FROM dunglas/frankenphp:php8.3-alpine

RUN install-php-extensions \
    redis \
    pdo_pgsql

WORKDIR /app


COPY . .

