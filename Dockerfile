FROM node:20.18.0-alpine
WORKDIR /abha-api/
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 7000
CMD ["npm", "start"]
