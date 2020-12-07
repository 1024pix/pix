FROM node:14

# To run chrome headless with no-sandbox.
ENV CI 1

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg --install google-chrome-stable_current_amd64.deb; apt-get update --yes && apt --fix-broken --yes install
