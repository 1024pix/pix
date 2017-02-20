const fs = require('fs');
const request = require('request');
const reqpro = require('request-promise');
const emailsPath = 'emails.txt';

_loadEmail(emailsPath)
  .then(_saveEmails)
  .catch(err => {
    throw new Error(err)
  });


function _loadEmail(emailsPath) {
  return new Promise((resolve) => {
    const emails = fs.readFileSync(emailsPath, 'utf8').toString().split('\n');
    resolve(emails);
  });
}

function _saveEmails(emails) {
  emails.forEach(async (email) => {
    if(email.length<1) return;
    const response = await _send(email);
    /* eslint-disable no-alert, no-console */
       console.log(_getLogMessage(response, email));
       console.log('------------------------------');
    /* eslint-enable no-alert, no-console */
  });
}

function _send(email) {
    return reqpro({
      method: 'POST',
      uri: 'http://localhost:3000/api/followers',
      body: JSON.stringify({'email': email})
    }).then(function (res) {
      return JSON.parse(res);
    })
    .catch(function(err){
      return JSON.parse(err.error);
    });
}

function _getLogMessage(response, email) {
  let message;
  switch(response.statusCode){
    case undefined:
      message = `Success! Subscription on ${response.email} is correctly saved`;
      break;

    case 409:
      message = `Error! Subscription on ${email} gets: ${response.message}`;
      break;

    default:
      message = `Error! Subscription on ${email} gets: ${response.message}`;
  }
  return message
}


