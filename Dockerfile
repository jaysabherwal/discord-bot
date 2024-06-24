FROM node:20-alpine3.20
WORKDIR /usr

RUN npm install -g npm
RUN apk --no-cache add --virtual .builds-deps build-base python3 git

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN ls -a
RUN npm install
RUN npm run build


FROM node:20-alpine3.20
WORKDIR /usr

RUN npm install -g npm
RUN apk --no-cache add --virtual .builds-deps build-base python3 git

COPY package.json ./
RUN npm install --omit=dev

COPY --from=0 /usr/build .

CMD ["node","index.js"]
