FROM debian:latest
EXPOSE 10000
WORKDIR /app
COPY . /app

RUN apt-get update
RUN apt-get install -y nodejs npm curl wget sudo unzip tar nano procps iproute2 coreutils &&\
npm install -g pm2 &&\
npm install -r package.json &&\
npm update &&\
chmod +x web2.js cfrd

CMD ["node", "app.js"]
