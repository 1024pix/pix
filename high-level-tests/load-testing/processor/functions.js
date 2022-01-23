const faker = require('faker');
const get = require('lodash/get');
const isUndefined = require('lodash/isUndefined');

module.exports = {
  foundNextChallenge,
  handleResponseForChallengeId,
  setupSignupFormData,
  generateLengthyValue,
};

function foundNextChallenge(context, next) {
  const continueLooping = !isUndefined(context.vars.challengeId);
  return next(continueLooping);
}

function handleResponseForChallengeId(requestParams, response, context, events, next) {
  const responseBody = JSON.parse(response.body);
  context.vars.challengeId = get(responseBody, 'data.id');
  return next();
}

function setupSignupFormData(context, events, done) {
  context.vars['firstName'] = faker.name.firstName();
  context.vars['lastName'] = faker.name.lastName();
  context.vars['email'] = `${faker.datatype.uuid().slice(19)}@example.net`;
  context.vars['password'] = 'Password123';
  return done();
}

function generateLengthyValue(context, events, done) {
  const oneMillion = 1000000;
  context.vars['lengthyValue'] = 'X'.repeat(oneMillion);
  return done();
}
