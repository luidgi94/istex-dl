FROM nginx:1.11.4

# to help docker debugging
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get -y update && apt-get -y install vim curl git-core

# nodejs installation used for build tools
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y build-essential nodejs

# install tools for bundle.js
WORKDIR /usr/share/nginx/html/
COPY ./package.json /usr/share/nginx/html/
RUN npm install

# install libs
WORKDIR /usr/share/nginx/html/www/
COPY ./www/package.json /usr/share/nginx/html/www/
RUN npm install

WORKDIR /usr/share/nginx/html/

# nginx config
COPY ./nginx/prod.conf /etc/nginx/conf.d/default.conf

# add source code (after npm install for docker build optimization reason)
COPY ./www/ /usr/share/nginx/html/www/
RUN echo '{ \
  "istexApiProtocol": "https", \
  "istexApiDomain": "api.istex.fr", \
  "istexApiUrl": "https://api.istex.fr", \
  "openUrlFTRedirectTo": "api-with-ezproxy-auth" \
}' > /usr/share/nginx/html/www/config.json


# ezmasterization of istex-dl
# see https://github.com/Inist-CNRS/ezmaster
RUN echo '{ \
  "httpPort": 80, \
  "configPath": "/usr/share/nginx/html/www/config.json" \
}' > /etc/ezmaster.json

# build www/dist/bundle.js and www/dist/bundle.css for production
COPY ./.babelrc /usr/share/nginx/html/www/
RUN npm run build
