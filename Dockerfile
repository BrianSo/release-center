FROM node:8

WORKDIR /usr/src/app

# Install Dependencies
COPY ./package.json ./yarn.lock ./
RUN yarn --production

# Install Production Code
COPY . ./

EXPOSE 3000
CMD [ "yarn", "start" ]