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

# Dar permissão e corrigir quebras de linha do Windows
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN apk add --no-cache libcap \
    && sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh \
    && setcap -r /usr/local/bin/frankenphp

EXPOSE 8080

ENTRYPOINT ["entrypoint.sh"]

