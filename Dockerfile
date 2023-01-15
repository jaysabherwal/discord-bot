FROM node:16-alpine3.17

WORKDIR /usr

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN ls -a
RUN npm install
RUN npm run build

FROM node:16-alpine3.17
WORKDIR /usr
COPY package.json ./
RUN npm install --only=production
COPY --from=0 /usr/build .
RUN npm install pm2 -g

CMD ["pm2-runtime","app.js"]
