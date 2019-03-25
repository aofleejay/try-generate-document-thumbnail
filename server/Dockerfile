FROM node:8.12.0
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN apt-get update
RUN apt-get install -y graphicsmagick
RUN apt-get install -y unoconv
RUN unoconv --listener
RUN yarn
COPY . .
EXPOSE 4000
CMD ["yarn", "serve"]
