'use strict';

const { scheduleSession } = require('./schedule-session');
const sessionRepository = require('../../infrastructure/repositories/session-repository');
const certificationCenterMembershipRepository = require('../../infrastructure/repositories/certification-center-membership-repository');
const certificationCenterRepository = require('../../infrastructure/repositories/certification-center-repository');
const random = require('../../infrastructure/random');

module.exports = {
  scheduleSession: (command) => {
    return scheduleSession({
      command,
      dependencies:
      {
        sessionRepository,
        certificationCenterMembershipRepository,
        certificationCenterRepository,
        random,
      },
    });
  },
};
