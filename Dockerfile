FROM node:12

WORKDIR /home/app
#USER node

COPY package*.json ./
RUN npm install --quiet

COPY . .

EXPOSE 3000






