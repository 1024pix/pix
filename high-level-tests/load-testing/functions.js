const faker = require('faker');
const queryString = require('query-string');
const { pickAnExternalIDP } = require('./user-credentials');

module.exports = {
  setupSignupFormData,
  foundNextChallenge,
  encodeSAMLRequest,
  extractAccessTokenFromLocation,
  setExternalUser,
  debug,
};

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

function encodeSAMLRequest(requestParams, context, ee, next) {
  context.vars.SAMLResponse = encodeURIComponent(context.vars.SAMLResponse);
  return next();
}

function extractAccessTokenFromLocation(context, events, done) {
  const tokenProperty = '/?token';
  context.vars.accessToken = queryString.parse(context.vars.location)[tokenProperty];
  return done();
}

function debug(context, events, done) {
  return done();
}

function setExternalUser(context, events, done) {
  const anExternalIdentifier = pickAnExternalIDP();
  context.vars.samlRequest = `IDO=${anExternalIdentifier}&PRE=Saml&NOM=Jackson`.toString();
  return done();
}
