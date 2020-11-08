# In /pix/api folder, execute
# docker build --tag api-local --file ../high-level-tests/load-testing/Dockerfile .
# You'll get otherwise
# COPY failed: Forbidden path outside the build context: ../../api ()
FROM node:12-alpine
COPY . .
# Install git from samlify to suceed
# You'll get otherwise
#npm ERR! syscall spawn git
#npm ERR! enoent Error while executing:
#npm ERR! enoent undefined ls-remote -h -t ssh://git@github.com/1024pix/samlify.git
RUN apk update && apk upgrade && apk add --no-cache bash git openssh
# Install python for node-gyp to suceed
# You'll get otherwise
#> heapdump@0.3.15 install /node_modules/heapdump
#> node-gyp rebuild
#gyp ERR! find Python
# From https://github.com/nodejs/docker-node/issues/384#issuecomment-305208112
RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python
# For development purpose
RUN apk add postgresql-client
RUN apk add redis
# Install packages
RUN npm ci
# Start on port 3000 (HapiJS default)
CMD ["npm", "run", "start"]
