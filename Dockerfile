FROM node:18-alpine
# Move to the app directory
WORKDIR /app

RUN apk --no-cache add \
      bash \
      g++ \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      make \
      python3

RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash


# Move to the app directory
WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY src/ src/

#RUN npm run build
RUN npx tsc src/* --outDir dist/

CMD node scheduler

# Copy package.json first to check if an npm install is needed