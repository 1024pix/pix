const campaign = require('./campaign-tooling');
const session = require('./session-tooling');
const profile = require('./profile-tooling');
const targetProfile = require('./target-profile-tooling');
const training = require('./training-tooling');
const organization = require('./organization-tooling');
const certificationCenter = require('./certification-center-tooling');

module.exports = {
  campaign,
  certificationCenter,
  organization,
  session,
  targetProfile,
  training,
  profile,
};
