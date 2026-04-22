FROM dunglas/frankenphp:php8.3-alpine

RUN install-php-extensions \
    redis \
    pdo_pgsql

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

# Instalar dependências do PHP
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

