FROM node:10-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080
CMD [ "npm", "start", "--", "--host=0.0.0.0", "--port=8080" ]
