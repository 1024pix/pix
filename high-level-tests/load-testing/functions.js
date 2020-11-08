const faker = require('faker');
const fs = require('fs');
const sizeof = require('sizeof');
let schoolingRegistrationXMLFormat;

function loadXMLFile(){
  require('dotenv').config();
  const XMLFileName = process.env.SCHOOLING_REGISTRATION_FILE_NAME;
  schoolingRegistrationXMLFormat = fs.readFileSync(XMLFileName, 'utf8');
  console.log(`Schooling registration in XML format from file ${XMLFileName} have been loaded in memory`);
  console.log('Memory used: ' + sizeof.sizeof(schoolingRegistrationXMLFormat, true));
}

loadXMLFile();

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

const setVarInContext = function(context, events, done) {

  context.vars['schoolingRegistrationXMLFormat'] = schoolingRegistrationXMLFormat;
  return done();

};

module.exports = {
  setupSignupFormData,
  foundNextChallenge,
  setVarInContext,
};
