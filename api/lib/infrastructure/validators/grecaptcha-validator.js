const request = require('request');
const config = require('../../settings');
const logger = require('../logger');
const { InvalidRecaptchaTokenError } = require('./errors');

module.exports = {

  verify(responseToken) {
    return new Promise((resolve, reject) => {
      request.post(`https://www.google.com/recaptcha/api/siteverify?secret=${config.googleReCaptcha.secret}&response=${responseToken}`, (err, response) => {
        if(err) {
          logger.error(err);
          return reject('An error occurred during connection to the Google servers');
        }

        const bodyResponse = JSON.parse(response.body);

        if(!bodyResponse.success) {
          const recaptchaError = new InvalidRecaptchaTokenError('Invalid reCaptcha token');
          return reject(recaptchaError);
        }

        return resolve();
      });
    });
  }
};

