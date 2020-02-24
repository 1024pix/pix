const faker = require('faker');

module.exports = {
  setupSignupFormData,
  foundNextChallenge
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
