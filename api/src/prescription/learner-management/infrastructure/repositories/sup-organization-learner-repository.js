import _ from 'lodash';
import { OrganizationLearnersCouldNotBeSavedError } from '../../domain/errors.js';
import { knex } from '../../../../../db/knex-database-connection.js';
import { OrganizationLearner } from '../../domain/models/OrganizationLearner.js';

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
];

const updateStudentNumber = async function (studentId, studentNumber) {
  await knex('organization-learners').where('id', studentId).update({ studentNumber });
};

const findOneByStudentNumberAndBirthdate = async function ({ organizationId, studentNumber, birthdate }) {
  const organizationLearner = await knex('organization-learners')
    .where('organizationId', organizationId)
    .where('birthdate', birthdate)
    .where('isDisabled', false)
    .whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber'])
    .first();

  return organizationLearner ? new OrganizationLearner(organizationLearner) : null;
};

const findOneByStudentNumber = async function ({ organizationId, studentNumber }) {
  const organizationLearner = await knex('organization-learners')
    .where('organizationId', organizationId)
    .whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber'])
    .first();

  return organizationLearner ? new OrganizationLearner(organizationLearner) : null;
};

const addStudents = async function (supOrganizationLearners) {
  await _upsertStudents(knex, supOrganizationLearners);
};

const replaceStudents = async function (organizationId, supOrganizationLearners) {
  await knex.transaction(async (transaction) => {
    await _disableAllOrganizationLearners(transaction, organizationId);
    await _upsertStudents(transaction, supOrganizationLearners);
  });
};

export {
  updateStudentNumber,
  findOneByStudentNumberAndBirthdate,
  findOneByStudentNumber,
  addStudents,
  replaceStudents,
};

async function _disableAllOrganizationLearners(queryBuilder, organizationId) {
  await queryBuilder('organization-learners')
    .update({ isDisabled: true, updatedAt: knex.raw('CURRENT_TIMESTAMP') })
    .where({ organizationId, isDisabled: false });
}

async function _upsertStudents(queryBuilder, supOrganizationLearners) {
  const supOrganizationLearnersToInsert = supOrganizationLearners.map((supOrganizationLearner) => ({
    ..._.pick(supOrganizationLearner, ATTRIBUTES_TO_SAVE),
    status: supOrganizationLearner.studyScheme,
    isDisabled: false,
    updatedAt: knex.raw('CURRENT_TIMESTAMP'),
  }));

  try {
    await queryBuilder('organization-learners')
      .insert(supOrganizationLearnersToInsert)
      .onConflict(['organizationId', 'studentNumber'])
      .merge();
  } catch (error) {
    throw new OrganizationLearnersCouldNotBeSavedError();
  }
}
