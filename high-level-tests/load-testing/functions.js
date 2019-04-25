const faker = require('faker');

module.exports = {
  setupSignupForData,
  foundNextChallenge
};

function setupSignupForData(context, events, done) {
  context.vars['firstName'] = faker.name.firstName();
  context.vars['lastName'] = faker.name.lastName();
  context.vars['email'] = faker.internet.email();
  context.vars['password'] = 'L0rem1psum';
  context.vars['recaptchaToken'] = '03AOLTBLTqRdrrotvqJsAXjUQO_7Q-qNLQLpCqZ1AfXgpmfkOZxQK53M1LXJjROVvy-D6iXYQ9fTfX6a4G4rE81CjGidLNUe7Gx_T1QTGJk2lxyPcT8rzzLMsDS68xSaTSG13GPrt3jCX00eVRZECCbiYRlUMqY9UhZ50VgSWwddDt8fS78xeJ7Ar1gH6xiy-HfmOm_pKr-EDnPWsapY6jU474BMpPBOPR5lQxLX4m7zlALTj_mpPwOVOIwgx6do22BZxF6AVh58_LtJ5gOq6uAO_nbAbJ4x_8Qn1NtYGuEHT2eDxcmbzgYkwNDYPsgkpXR49rs4BC6OywGw7UeTp6jnDoxaixkRjkE4qSWHsRyMOuQYY3yNZvuWHtHGdWzaRDExFJNyqfwBfc';
  return done();
}

function foundNextChallenge(context, next) {
  const continueLooping = !!context.vars.challengeId;
  return next(continueLooping);
}
