# Release Center
A web application for you to release your app/binary
in an organized way.


## Development:

1. Traditional (Recommanded)
```
# prepare mongodb
yarn
# create a .env file and set up your environment variables
yarn watch
# start development now
```

2. Using Docker
This option run your development server in docker.
Your code change needs ~ 10s to make changes to your
docker environment. This is good to test the server
against production environment while active development.
```
# install docker & docker-compose
yarn watch-build
# in another terminal
yarn docker-watch
# start development now
```


## Deployment

1. Traditional
```
# setup mongodb in your server
# edit .env file
yarn build
NODE_ENV=production yarn start

# make a service or use pm2 to make your app run as daemon
```

2. Using docker (Recommended)
```
# install docker and init docker swarm
# init docker swarm is easy
docker swarm init

# A production template docker-compose.stack.yml is provided for you
# Please make change according your environment
# Traefik label is added for traefik reverse-proxy. Remove it if you don't need it.
docker stack deploy -c docker-compose.stack.yml
```

### Roadmap

1. Create Project and Release <-- Finish
2. Release Expiration
3. Release Password Protection
4. Public API for release version checking, release download **<-- Current**
5. Customizable Project Page (Online Pug Editor), Templates
6. Email/Telegram Release Notification