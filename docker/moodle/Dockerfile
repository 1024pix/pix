ARG MOODLE_DOCKER_PHP_VERSION=latest

# Build image to clone Moodle version
FROM alpine/git:latest@sha256:a4bb51f1a3553df194ce679fc1db721d8bfba2046fa1a88fe9d4ac551ffbce25

ARG MOODLE_DOCKER_WWWROOT
ARG MOODLE_VERSION

# Clone Moodle version and remove git files
RUN git clone --revision ${MOODLE_VERSION} --depth=1 git://git.moodle.org/moodle.git ${MOODLE_DOCKER_WWWROOT} && rm -rf ${MOODLE_DOCKER_WWWROOT}/.git*

# Copy config file into clone Moodle version
COPY config.php ${MOODLE_DOCKER_WWWROOT}

# Start from https://github.com/moodlehq/moodle-php-apache (Apache + PHP preconfigured with all extensions required for Moodle)
FROM moodlehq/moodle-php-apache:${MOODLE_DOCKER_PHP_VERSION}

ARG MOODLE_DOCKER_WWWROOT

# Copy (from build image) prepared Moodle version in /var/www/html
COPY --from=0 /git/${MOODLE_DOCKER_WWWROOT} /var/www/html
