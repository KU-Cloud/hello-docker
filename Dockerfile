FROM node:6-alpine

WORKDIR /usr/src/app

COPY index.js package*.json ./

RUN npm install

EXPOSE 8080
CMD ["npm", "start"]