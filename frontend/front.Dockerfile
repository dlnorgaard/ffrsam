# ffRSAM - backend container containing Python and cron jobs
# 
FROM php:7-apache
LABEL maintainer="dnorgaard@usgs.gov"
WORKDIR /
RUN apt-get -y update

# install PHP packages
RUN docker-php-source extract \
  && docker-php-source delete \
  && docker-php-ext-install json mysqli 

COPY php.ini /usr/local/etc/php/

# enable rewrite
RUN cp /etc/apache2/mods-available/rewrite.load /etc/apache2/mods-enabled/

# expose port 80
EXPOSE 80

# make sure web server can serve within 3 seconds
HEALTHCHECK --interval=5m --timeout=3s \
  CMD curl -f http://localhost/ || exit 1


# DONE
