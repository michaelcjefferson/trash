FROM node:10
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# If building for production, use:
# RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD [ "node", "server/index.js" ]