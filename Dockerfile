FROM php:8.4-fpm

# Install system dependencies & Node.js (for Vite)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install core PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring pcntl bcmath gd sockets

# Install Redis extension for fast caching/sessions
RUN pecl install redis && docker-php-ext-enable redis

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Expose port 9000 for php-fpm
EXPOSE 9000

CMD ["php-fpm"]
