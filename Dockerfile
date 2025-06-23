FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

<<<<<<< HEAD
EXPOSE 3000
=======
EXPOSE 5000
>>>>>>> 4a72911df284e0ff621b2563b5f6fd902d7e545e
CMD ["npm", "start"]
