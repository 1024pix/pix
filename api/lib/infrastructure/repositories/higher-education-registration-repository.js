const { knex } = require('../bookshelf');
const _ = require('lodash');

const { SchoolingRegistrationsCouldNotBeSavedError } = require('../../domain/errors');

module.exports = {

  async saveSet(higherEducationRegistrationSet, organizationId) {

    const schoolingRegistrationRows = higherEducationRegistrationSet
      .registrations
      .map((registration) => {
        return {
          ..._.omit(registration, 'studyScheme'),
          status: registration.studyScheme,
          organizationId
        };
      });
    try {
      await knex('schooling-registrations').insert(schoolingRegistrationRows);
    } catch (error) {
      const results = error.detail.match(/=\((.+),/);
      throw new SchoolingRegistrationsCouldNotBeSavedError(`{ organizationId: ${organizationId}, studentNumber: ${results[1]} }`);
    }
  }
};
