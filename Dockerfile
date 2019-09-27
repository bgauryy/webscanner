FROM browserless/chrome:latest
FROM node:8

##docker build -t <your username>/node-web-app .
##docker run -p 49160:8080 -d <your username>/node-web-app
## docker logs <container id>

RUN docker run -p 9999:3000 browserless/chrome

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
