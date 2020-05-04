FROM node:12.16.2-alpine

LABEL maintainer="dongri@gobase.io"

RUN apk add --update alpine-sdk

RUN npm install -g nodemon@2.0.3

RUN mkdir -p /app/src

ADD package.json /app/package.json

WORKDIR /app/src

RUN cd /app
RUN rm -rf node_modules
RUN npm install

EXPOSE 3000

CMD NODE_ENV=development PORT=3000 nodemon server.js
