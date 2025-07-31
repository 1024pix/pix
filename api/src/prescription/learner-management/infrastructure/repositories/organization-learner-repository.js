import _ from 'lodash';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  NotFoundError,
  OrganizationLearnersCouldNotBeSavedError,
  UserCouldNotBeReconciledError,
} from '../../../../shared/domain/errors.js';
import * as organizationLearnerRepository from '../../../../shared/infrastructure/repositories/organization-learner-repository.js';
import { OrganizationLearnerCertificabilityNotUpdatedError } from '../../domain/errors.js';
import { CommonOrganizationLearner } from '../../domain/models/CommonOrganizationLearner.js';
import { OrganizationLearner } from '../../domain/models/OrganizationLearner.js';
import { OrganizationLearnerForAdmin } from '../../domain/read-models/OrganizationLearnerForAdmin.js';
import * as studentRepository from './student-repository.js';

const dissociateUserFromOrganizationLearner = async function (organizationLearnerId) {
  const knexConn = DomainTransaction.getConnection();

  await _queryBuilderDissociation(knexConn).where({ id: organizationLearnerId });
};

function _queryBuilderDissociation(knexConn) {
  return knexConn('organization-learners').update({
    userId: null,
    certifiableAt: null,
    isCertifiable: null,
    updatedAt: new Date(),
  });
}

const getOrganizationLearnerForAdmin = async function (organizationLearnerId) {
  const knexConn = DomainTransaction.getConnection();

  const organizationLearner = await knexConn('view-active-organization-learners')
    .select(
      'view-active-organization-learners.id as id',
      'firstName',
      'lastName',
      'birthdate',
      'division',
      'group',
      'organizationId',
      'organizations.name as organizationName',
      'view-active-organization-learners.createdAt as createdAt',
      'view-active-organization-learners.updatedAt as updatedAt',
      'isDisabled',
      'organizations.isManagingStudents as organizationIsManagingStudents',
    )
    .innerJoin('organizations', 'organizations.id', 'view-active-organization-learners.organizationId')
    .where({ 'view-active-organization-learners.id': organizationLearnerId })
    .first();

  if (!organizationLearner) {
    throw new NotFoundError(`Organization Learner not found for ID ${organizationLearnerId}`);
  }
  return new OrganizationLearnerForAdmin(organizationLearner);
};

const removeByIds = function ({ organizationLearnerIds, userId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('organization-learners')
    .whereIn('id', organizationLearnerIds)
    .whereNull('deletedAt')
    .update({ updatedAt: new Date(), deletedAt: new Date(), deletedBy: userId });
};

const disableAllOrganizationLearnersInOrganization = async function ({ organizationId, nationalStudentIds }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('organization-learners')
    .where({ organizationId, isDisabled: false })
    .whereNotIn('nationalStudentId', nationalStudentIds)
    .update({ isDisabled: true, updatedAt: knexConn.raw('CURRENT_TIMESTAMP') });
};

const addOrUpdateOrganizationOfOrganizationLearners = async function (organizationLearnerDatas, organizationId) {
  const knexConn = DomainTransaction.getConnection();
  const organizationLearnersFromFile = organizationLearnerDatas.map(
    (organizationLearnerData) =>
      new OrganizationLearner({
        ...organizationLearnerData,
        organizationId,
      }),
  );
  const existingOrganizationLearners = await organizationLearnerRepository.findByOrganizationId({ organizationId });

  const reconciledOrganizationLearnersToImport = await _reconcileOrganizationLearners(
    organizationLearnersFromFile,
    existingOrganizationLearners,
  );

  try {
    const organizationLearnersToSave = reconciledOrganizationLearnersToImport.map((organizationLearner) => ({
      ..._.omit(organizationLearner, ['id', 'createdAt', 'isCertifiable', 'certifiableAt']),
      updatedAt: knexConn.raw('CURRENT_TIMESTAMP'),
      isDisabled: false,
    }));

    await knexConn('organization-learners')
      .insert(organizationLearnersToSave)
      .onConflict(knexConn.raw('("organizationId","nationalStudentId") where "deletedAt" is NULL'))
      .merge();
  } catch {
    throw new OrganizationLearnersCouldNotBeSavedError();
  }
};

const _reconcileOrganizationLearners = async function (studentsToImport, allOrganizationLearnersInSameOrganization) {
  const nationalStudentIdsFromFile = studentsToImport
    .map((organizationLearnerData) => organizationLearnerData.nationalStudentId)
    .filter(Boolean);
  const organizationLearnersWithSameNationalStudentIdsAsImported =
    await studentRepository.findReconciledStudentsByNationalStudentId(nationalStudentIdsFromFile);

  organizationLearnersWithSameNationalStudentIdsAsImported.forEach((organizationLearner) => {
    const alreadyReconciledStudentToImport = studentsToImport.find(
      (studentToImport) => studentToImport.userId === organizationLearner.account.userId,
    );

    if (alreadyReconciledStudentToImport) {
      alreadyReconciledStudentToImport.userId = null;
      return;
    }

    const studentToImport = studentsToImport.find(
      (studentToImport) => studentToImport.nationalStudentId === organizationLearner.nationalStudentId,
    );

    if (
      _shouldStudentToImportBeReconciled(
        allOrganizationLearnersInSameOrganization,
        organizationLearner,
        studentToImport,
      )
    ) {
      studentToImport.userId = organizationLearner.account.userId;
    }
  });
  return studentsToImport;
};

function _shouldStudentToImportBeReconciled(
  allOrganizationLearnersInSameOrganization,
  organizationLearner,
  studentToImport,
) {
  const organizationLearnerWithSameUserId = allOrganizationLearnersInSameOrganization.find(
    (organizationLearnerInSameOrganization) => {
      return organizationLearnerInSameOrganization.userId === organizationLearner.account.userId;
    },
  );
  const isOrganizationLearnerReconciled = organizationLearnerWithSameUserId != null;
  const organizationLearnerHasSameUserIdAndNationalStudentId =
    organizationLearnerWithSameUserId?.nationalStudentId === organizationLearner.nationalStudentId;

  if (isOrganizationLearnerReconciled && !organizationLearnerHasSameUserIdAndNationalStudentId) {
    return false;
  }

  const isFromSameOrganization = studentToImport.organizationId === organizationLearner.account.organizationId;
  const isFromDifferentOrganizationWithSameBirthday =
    !isFromSameOrganization && studentToImport.birthdate === organizationLearner.account.birthdate;
  return isFromSameOrganization || isFromDifferentOrganizationWithSameBirthday;
}

const saveCommonOrganizationLearners = function (learners) {
  const knex = DomainTransaction.getConnection();

  return Promise.all(
    learners.map((learner) => {
      return knex('organization-learners').insert(learner).onConflict('id').merge({
        firstName: learner.firstName,
        lastName: learner.lastName,
        attributes: learner.attributes,
        isDisabled: false,
        updatedAt: new Date(),
      });
    }),
  );
};

const disableCommonOrganizationLearnersFromOrganizationId = function ({
  organizationId,
  excludeOrganizationLearnerIds = [],
}) {
  const knex = DomainTransaction.getConnection();
  return knex('organization-learners')
    .where({ organizationId, isDisabled: false })
    .whereNull('deletedAt')
    .update({ isDisabled: true, updatedAt: new Date() })
    .whereNotIn('id', excludeOrganizationLearnerIds);
};

const findAllCommonLearnersFromOrganizationId = async function ({ organizationId }) {
  const knex = DomainTransaction.getConnection();

  const existingLearners = await knex('view-active-organization-learners')
    .select(['firstName', 'id', 'lastName', 'userId', 'organizationId', 'attributes'])
    .where({ organizationId });

  return existingLearners.map(
    ({ firstName, lastName, id, userId, organizationId, attributes }) =>
      new CommonOrganizationLearner({ firstName, lastName, id, userId, organizationId, ...attributes }),
  );
};

/**
 * @function
 * @name findAllCommonOrganizationLearnerByReconciliationInfos
 * @param {Object} params
 * @param {number} params.organizationId
 * @param {Object} params.reconciliationInformations
 * @returns {Promise<CommonOrganizationLearner[]>}
 */
const findAllCommonOrganizationLearnerByReconciliationInfos = async function ({
  organizationId,
  reconciliationInformations,
}) {
  const knex = DomainTransaction.getConnection();

  const query = knex('view-active-organization-learners')
    .select('firstName', 'lastName', 'id', 'attributes', 'userId')
    .where({ organizationId, isDisabled: false });

  if (reconciliationInformations) {
    query.whereJsonSupersetOf('attributes', reconciliationInformations);
  }

  const result = await query;

  return result.map(
    ({ firstName, lastName, id, userId, attributes }) =>
      new CommonOrganizationLearner({ id, firstName, lastName, organizationId, userId, ...attributes }),
  );
};

const update = async function (organizationLearner) {
  const knex = DomainTransaction.getConnection();

  const { id, ...attributes } = organizationLearner;
  const updatedRows = await knex('organization-learners').update(attributes).where({ id });
  return updatedRows === 1;
};

const reconcileUserByNationalStudentIdAndOrganizationId = async function ({
  nationalStudentId,
  userId,
  organizationId,
}) {
  const knexConn = DomainTransaction.getConnection();
  try {
    const [rawOrganizationLearner] = await knexConn('organization-learners')
      .where({
        organizationId,
        nationalStudentId,
        isDisabled: false,
      })
      .update({ userId, updatedAt: knexConn.fn.now() })
      .returning('*');

    if (!rawOrganizationLearner) throw new Error();
    return new OrganizationLearner(rawOrganizationLearner);
  } catch {
    throw new UserCouldNotBeReconciledError();
  }
};

const countByUserId = async function (userId) {
  const knexConn = DomainTransaction.getConnection();
  const { count } = await knexConn('organization-learners').count('id').where({ userId }).first();

  return count;
};

const findByUserId = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  const rawOrganizationLearners = await knexConn
    .select('*')
    .from('view-active-organization-learners')
    .where({ userId })
    .orderBy('id');

  return rawOrganizationLearners.map((rawOrganizationLearner) => new OrganizationLearner(rawOrganizationLearner));
};

const findOrganizationLearnersByOrganizationId = async function ({ organizationId }) {
  const knexConnection = DomainTransaction.getConnection();
  const organizationLearners = await knexConnection('view-active-organization-learners').where({ organizationId });
  return organizationLearners.map((organizationLearner) => _toDomain(organizationLearner));
};

const reconcileUserToOrganizationLearner = async function ({ userId, organizationLearnerId }) {
  try {
    const knexConn = DomainTransaction.getConnection();
    const [rawOrganizationLearner] = await knexConn('organization-learners')
      .where({ id: organizationLearnerId })
      .where('isDisabled', false)
      .update({ userId, updatedAt: knexConn.fn.now() })
      .returning('*');
    if (!rawOrganizationLearner) throw new Error();
    return new OrganizationLearner(rawOrganizationLearner);
  } catch {
    throw new UserCouldNotBeReconciledError();
  }
};

async function updateCertificability(organizationLearner) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('organization-learners').where({ id: organizationLearner.id }).update({
    isCertifiable: organizationLearner.isCertifiable,
    certifiableAt: organizationLearner.certifiableAt,
  });
  if (result === 0) {
    throw new OrganizationLearnerCertificabilityNotUpdatedError(
      `Could not update certificability for OrganizationLearner with ID ${organizationLearner.id}.`,
    );
  }
}

async function getLearnerInfo(organizationLearnerId) {
  const knexConn = DomainTransaction.getConnection();

  const organizationLearner = await knexConn
    .select('*')
    .from('view-active-organization-learners')
    .where({ id: organizationLearnerId })
    .first();

  if (!organizationLearner) {
    throw new NotFoundError(`Student not found for ID ${organizationLearnerId}`);
  }
  return new OrganizationLearner(organizationLearner);
}

const remove = async (organizationLearner) => {
  const knexConn = DomainTransaction.getConnection();

  return knexConn('organization-learners').where('id', organizationLearner.id).update(_toInfra(organizationLearner));
};

function _toDomain(result) {
  return new OrganizationLearner(result);
}

function _toInfra(organizationLearner) {
  return {
    lastName: organizationLearner.lastName,
    preferredLastName: organizationLearner.preferredLastName,
    firstName: organizationLearner.firstName,
    middleName: organizationLearner.middleName,
    thirdName: organizationLearner.thirdName,
    sex: organizationLearner.sex,
    birthdate: organizationLearner.birthdate,
    birthCity: organizationLearner.birthCity,
    birthCityCode: organizationLearner.birthCityCode,
    birthProvinceCode: organizationLearner.birthProvinceCode,
    birthCountryCode: organizationLearner.birthCountryCode,
    status: organizationLearner.status,
    nationalStudentId: organizationLearner.nationalStudentId,
    division: organizationLearner.division,
    updatedAt: organizationLearner.updatedAt,
    userId: organizationLearner.userId,
    email: organizationLearner.email,
    studentNumber: organizationLearner.studentNumber,
    department: organizationLearner.department,
    educationalTeam: organizationLearner.educationalTeam,
    group: organizationLearner.group,
    diploma: organizationLearner.diploma,
    nationalApprenticeId: organizationLearner.nationalApprenticeId,
    deletedAt: organizationLearner.deletedAt,
    deletedBy: organizationLearner.deletedBy,
  };
}

/**
 * @function
 * @name findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId
 * @param {Object} params
 * @param {number} params.organizationId
 * @returns {Promise<number[]>}
 */
const findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId = async function ({ organizationId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('view-active-organization-learners').where({ organizationId }).whereNull('attributes').pluck('id');
};

const updateName = async function ({ organizationLearnerId, firstName, lastName }) {
  const knexConn = DomainTransaction.getConnection();

  const updatedRows = await knexConn('organization-learners')
    .where({ id: organizationLearnerId })
    .whereNull('deletedAt')
    .update({
      firstName,
      lastName,
      updatedAt: new Date(),
    });

  if (updatedRows === 0) {
    throw new NotFoundError(`Organization Learner not found for ID ${organizationLearnerId}`);
  }
};

export {
  addOrUpdateOrganizationOfOrganizationLearners,
  countByUserId,
  disableAllOrganizationLearnersInOrganization,
  disableCommonOrganizationLearnersFromOrganizationId,
  dissociateUserFromOrganizationLearner,
  findAllCommonLearnersFromOrganizationId,
  findAllCommonOrganizationLearnerByReconciliationInfos,
  findByUserId,
  findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId,
  findOrganizationLearnersByOrganizationId,
  getLearnerInfo,
  getOrganizationLearnerForAdmin,
  reconcileUserByNationalStudentIdAndOrganizationId,
  reconcileUserToOrganizationLearner,
  remove,
  removeByIds,
  saveCommonOrganizationLearners,
  update,
  updateCertificability,
  updateName,
};
