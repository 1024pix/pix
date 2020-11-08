const faker = require('faker');
const fs = require('fs');
require('dotenv').config();

function setupSignupFormData(context, events, done) {
  context.vars['firstName'] = faker.name.firstName();
  context.vars['lastName'] = faker.name.lastName();
  context.vars['email'] = faker.internet.exampleEmail();
  context.vars['password'] = 'L0rem1psum';
  return done();
}

function foundNextChallenge(context, next) {
  const continueLooping = !!context.vars.challengeId;
  return next(continueLooping);
}

const loadXMLFile = function(context, events, done) {

  fs.readFile(process.env.SCHOOLING_REGISTRATION_FILE_NAME, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    context.vars['XML'] = data;
    return done();
  });
};

module.exports = {
  setupSignupFormData,
  foundNextChallenge,
  loadXMLFile,
};
