FROM node:18.7.0-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY ["package.json", "yarn.lock", "tsconfig.json", "./"]
RUN yarn install


COPY ["src", "./src"]
COPY ["public", "./public"]

CMD ["yarn", "start"]
EXPOSE 3000