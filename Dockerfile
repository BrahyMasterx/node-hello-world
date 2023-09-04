FROM debian:latest
EXPOSE 3000
WORKDIR /app
COPY . /app

RUN apt-get update
RUN apt-get install -y nodejs npm curl sudo

RUN npm install
RUN npm update

CMD ["node", "app.js"]
