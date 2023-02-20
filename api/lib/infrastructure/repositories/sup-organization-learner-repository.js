import _ from 'lodash';
import { OrganizationLearnersCouldNotBeSavedError } from '../../domain/errors';
import { knex } from '../../../db/knex-database-connection';
import BookshelfOrganizationLearner from '../orm-models/OrganizationLearner';
import bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter';

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

export default {
  async updateStudentNumber(studentId, studentNumber) {
    await BookshelfOrganizationLearner.where('id', studentId).save(
      { studentNumber },
      {
        patch: true,
      }
    );
  },

  async findOneByStudentNumberAndBirthdate({ organizationId, studentNumber, birthdate }) {
    const organizationLearner = await BookshelfOrganizationLearner.query((qb) => {
      qb.where('organizationId', organizationId);
      qb.where('birthdate', birthdate);
      qb.where('isDisabled', false);
      qb.whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber']);
    }).fetch({ require: false });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfOrganizationLearner, organizationLearner);
  },

  async findOneByStudentNumber({ organizationId, studentNumber }) {
    const organizationLearner = await BookshelfOrganizationLearner.query((qb) => {
      qb.where('organizationId', organizationId);
      qb.whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber']);
    }).fetch({ require: false });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfOrganizationLearner, organizationLearner);
  },

  async addStudents(supOrganizationLearners) {
    await _upsertStudents(knex, supOrganizationLearners);
  },

  async replaceStudents(organizationId, supOrganizationLearners) {
    await knex.transaction(async (transaction) => {
      await _disableAllOrganizationLearners(transaction, organizationId);
      await _upsertStudents(transaction, supOrganizationLearners);
    });
  },
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
