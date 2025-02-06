
FROM node:20.9.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 3000

RUN npm run build

CMD [ "npm", "start" ]