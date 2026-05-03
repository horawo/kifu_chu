FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql

# Enable mod_rewrite for routing
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy custom apache config if needed (optional)
# COPY ./docker/php/000-default.conf /etc/apache2/sites-available/000-default.conf

# Change DocumentRoot to /var/www/html/public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Allow .htaccess to work (Note: The path in Directory block must match new DocumentRoot)
RUN echo "<Directory /var/www/html/public>" >> /etc/apache2/conf-available/docker-php.conf && \
    echo "    AllowOverride All" >> /etc/apache2/conf-available/docker-php.conf && \
    echo "</Directory>" >> /etc/apache2/conf-available/docker-php.conf && \
    a2enconf docker-php
