FROM node:16-alpine3.17
WORKDIR /usr

RUN npm install -g npm@9.8.1
RUN apk --no-cache add --virtual .builds-deps build-base python3 git

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN ls -a
RUN npm install
RUN npm run build


FROM node:16-alpine3.17
WORKDIR /usr

RUN npm install -g npm@9.8.1
RUN apk --no-cache add --virtual .builds-deps build-base python3 git

COPY package.json ./
RUN npm install --only=production

COPY --from=0 /usr/build .

CMD ["node","index.js"]
