FROM node:12

WORKDIR /home/app
#USER node

COPY package*.json ./
RUN npm install --quiet

COPY . .

EXPOSE 3000

#for production switch to the second command
#in development run webpack --watch in a second terminal for sass->css live conversion, or use other compiler


#CMD ["npm", "run", "dev"]
#CMD ["npm", "run", "start"]




