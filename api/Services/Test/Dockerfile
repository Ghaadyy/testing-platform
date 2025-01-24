FROM node:22.11.0

WORKDIR /app

RUN npm install websocket selenium-webdriver && npm install -g mocha

ENV SELENIUM_REMOTE_URL=http://host.docker.internal:4444/wd/hub

CMD ["bash"]