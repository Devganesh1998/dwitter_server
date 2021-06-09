FROM node:12
WORKDIR /app
COPY package*.json /app
RUN yarn install

COPY . /app
COPY .env /app

EXPOSE 4500
CMD [ "yarn", "run", "dev" ]
