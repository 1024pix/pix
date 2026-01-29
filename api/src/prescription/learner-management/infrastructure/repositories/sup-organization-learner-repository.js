import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { OrganizationLearnersCouldNotBeSavedError } from '../../domain/errors.js';
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
  const knexConn = DomainTransaction.getConnection();
  await knexConn('organization-learners').where('id', studentId).update({ studentNumber });
};

const findOneByStudentNumberAndBirthdate = async function ({ organizationId, studentNumber, birthdate }) {
  const knexConn = DomainTransaction.getConnection();
  const organizationLearner = await knexConn('view-active-organization-learners')
    .where('organizationId', organizationId)
    .where('birthdate', birthdate)
    .where('isDisabled', false)
    .whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber'])
    .first();

  return organizationLearner ? new OrganizationLearner(organizationLearner) : null;
};

const findOneByStudentNumber = async function ({ organizationId, studentNumber }) {
  const knexConn = DomainTransaction.getConnection();
  const organizationLearner = await knexConn('view-active-organization-learners')
    .where('organizationId', organizationId)
    .where('isDisabled', false)
    .whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber'])
    .first();

  return organizationLearner ? new OrganizationLearner(organizationLearner) : null;
};

const addStudents = async function (supOrganizationLearners) {
  await _upsertStudents(supOrganizationLearners);
};

export {
  addStudents,
  findOneByStudentNumber,
  findOneByStudentNumberAndBirthdate,
  getOrganizationLearnerIdsNotInList,
  updateStudentNumber,
};

async function getOrganizationLearnerIdsNotInList({ organizationId, studentNumberList }) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn('organization-learners')
    .select('id')
    .where({ organizationId })
    .whereNull('deletedAt')
    .where(function () {
      this.whereNotIn('studentNumber', studentNumberList).orWhereNull('studentNumber');
    })
    .pluck('id');
}

async function _upsertStudents(supOrganizationLearners) {
  const knexConn = DomainTransaction.getConnection();
  const supOrganizationLearnersToInsert = supOrganizationLearners.map((supOrganizationLearner) => ({
    ..._.pick(supOrganizationLearner, ATTRIBUTES_TO_SAVE),
    status: supOrganizationLearner.studyScheme,
    isDisabled: false,
    updatedAt: knex.raw('CURRENT_TIMESTAMP'),
  }));

  try {
    await knexConn('organization-learners')
      .insert(supOrganizationLearnersToInsert)
      .onConflict(knex.raw('("studentNumber", "organizationId") where "deletedAt" is NULL and "deletedBy" is NULL'))
      .merge();
  } catch {
    throw new OrganizationLearnersCouldNotBeSavedError();
  }
}
