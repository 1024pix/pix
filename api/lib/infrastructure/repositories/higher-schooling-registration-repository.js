const _ = require('lodash');
const { SchoolingRegistrationsCouldNotBeSavedError } = require('../../domain/errors');
const { knex } = require('../bookshelf');
const { getChunkSizeForParameterBinding } = require('../utils/knex-utils');
const BookshelfSchoolingRegistration = require('../data/schooling-registration');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

const ATTRIBUTES_TO_SAVE = [
  'firstName',
  'middleName',
  'thirdName',
  'lastName',
  'preferredLastName',
  'studentNumber',
  'email',
  'diploma',
  'department',
  'educationalTeam',
  'group',
  'status',
  'birthdate',
  'organizationId',
  'isSupernumerary',
];

module.exports = {

  async saveAndReconcile(higherSchoolingRegistration, userId) {
    try {
      const registrationToSave = _.pick(higherSchoolingRegistration, ATTRIBUTES_TO_SAVE);
      registrationToSave.status = higherSchoolingRegistration.studyScheme;
      registrationToSave.userId = userId;

      await knex('schooling-registrations').insert({ ...registrationToSave });
    } catch (error) {
      throw new SchoolingRegistrationsCouldNotBeSavedError();
    }
  },

  saveSet(higherSchoolingRegistrationSet) {
    const registrationDataToSave = higherSchoolingRegistrationSet.registrations.map((registration) => {
      const registrationToSave = _.pick(registration, ATTRIBUTES_TO_SAVE);
      registrationToSave.status = registration.studyScheme;
      return registrationToSave;
    });

    return _upsert(registrationDataToSave);
  },

  async findByOrganizationIdAndStudentNumber({ organizationId, studentNumber }) {
    const schoolingRegistration = await BookshelfSchoolingRegistration
      .query((qb) => {
        qb.where('organizationId', organizationId);
        qb.whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber']);
      })
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistration);
  },

  async updateStudentNumber(studentId, studentNumber) {
    await BookshelfSchoolingRegistration
      .where('id', studentId)
      .save({ studentNumber }, {
        patch: true,
      });
  },

  async findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { birthdate, studentNumber } = {} }) {
    const schoolingRegistration = await BookshelfSchoolingRegistration
      .query((qb) => {
        qb.where('organizationId', organizationId);
        qb.where('isSupernumerary', false);
        if (birthdate) qb.where('birthdate', birthdate);
        if (studentNumber) qb.whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber']);
      })
      .fetch();

    return bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration);
  },
};

async function _upsert(registrationDataToSave) {
  const baseQuery = _getBaseQueryForUpsert();
  const registrationDataChunks = _chunkRegistrations(registrationDataToSave);
  const trx = await knex.transaction();
  try {
    for (const registrationDataChunk of registrationDataChunks) {
      await trx.raw(baseQuery, [
        knex('schooling-registrations').insert(registrationDataChunk),
      ]);
    }
    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw new SchoolingRegistrationsCouldNotBeSavedError();
  }
}

function _chunkRegistrations(registrations) {
  const chunkSize = getChunkSizeForParameterBinding(_.head(registrations));
  return _.chunk(registrations, chunkSize);
}

function _getBaseQueryForUpsert() {
  let update = ATTRIBUTES_TO_SAVE
    .map((key) => `"${key}" = EXCLUDED."${key}"`)
    .join(', ');
  update += ', "updatedAt" = CURRENT_TIMESTAMP';
  return `? ON CONFLICT ("organizationId", "studentNumber") WHERE "isSupernumerary" IS FALSE DO UPDATE SET ${update}`;
}
