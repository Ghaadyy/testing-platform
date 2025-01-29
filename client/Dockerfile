FROM node:22.11.0

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN npm install

COPY . .

EXPOSE 5173

CMD npm run dev