import { knex } from '../../../db/knex-database-connection.js';
import { ORGANIZATION_FEATURE } from '../../../src/shared/domain/constants.js';
import {
  NotFoundError,
  OrganizationLearnerCertificabilityNotUpdatedError,
  OrganizationLearnerNotFound,
  UserCouldNotBeReconciledError,
  UserNotFoundError,
} from '../../../src/shared/domain/errors.js';
import { OrganizationLearner } from '../../../src/shared/domain/models/OrganizationLearner.js';
import { ParticipantRepartition } from '../../../src/shared/domain/models/ParticipantRepartition.js';
import { fetchPage } from '../../../src/shared/infrastructure/utils/knex-utils.js';
import { DomainTransaction } from '../DomainTransaction.js';
import * as studentRepository from './student-repository.js';

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

const findByIds = async function ({ ids }) {
  const rawOrganizationLearners = await knex
    .select('*')
    .from('view-active-organization-learners')
    .whereIn('id', ids)
    .orderBy('id');

  return rawOrganizationLearners.map((rawOrganizationLearner) => new OrganizationLearner(rawOrganizationLearner));
};

const findByOrganizationId = function ({ organizationId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('view-active-organization-learners')
    .where({ organizationId })
    .orderByRaw('LOWER("lastName") ASC, LOWER("firstName") ASC')
    .then((organizationLearners) =>
      organizationLearners.map((organizationLearner) => new OrganizationLearner(organizationLearner)),
    );
};

const findByOrganizationIdAndUpdatedAtOrderByDivision = async function ({ organizationId, page, filter }) {
  const BEGINNING_OF_THE_2020_SCHOOL_YEAR = '2020-08-15';
  const query = knex('view-active-organization-learners')
    .where({
      organizationId,
      isDisabled: false,
    })
    .where('updatedAt', '>', BEGINNING_OF_THE_2020_SCHOOL_YEAR)
    .orderByRaw('LOWER("division") ASC, LOWER("lastName") ASC, LOWER("firstName") ASC');

  if (filter.divisions) {
    query.whereIn('division', filter.divisions);
  }

  const { results, pagination } = await fetchPage(query, page);

  return {
    data: results.map((result) => new OrganizationLearner(result)),
    pagination,
  };
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

const findByOrganizationIdAndBirthdate = async function ({ organizationId, birthdate }) {
  const rawOrganizationLearners = await knex
    .select('*')
    .from('view-active-organization-learners')
    .where({ organizationId, birthdate, isDisabled: false })
    .orderBy('id');

  return rawOrganizationLearners.map((rawOrganizationLearner) => new OrganizationLearner(rawOrganizationLearner));
};

const reconcileUserToOrganizationLearner = async function ({ userId, organizationLearnerId }) {
  try {
    const knexConn = DomainTransaction.getConnection();
    const [rawOrganizationLearner] = await knexConn('organization-learners')
      .where({ id: organizationLearnerId })
      .where('isDisabled', false)
      .update({ userId, updatedAt: knex.fn.now() })
      .returning('*');
    if (!rawOrganizationLearner) throw new Error();
    return new OrganizationLearner(rawOrganizationLearner);
  } catch (error) {
    throw new UserCouldNotBeReconciledError();
  }
};

const dissociateAllStudentsByUserId = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  await _queryBuilderDissociation(knexConn)
    .where({ userId })
    .whereIn(
      'organization-learners.organizationId',
      knex.select('id').from('organizations').where({ isManagingStudents: true }),
    );
};

function _queryBuilderDissociation(knexConn) {
  return knexConn('organization-learners').update({
    userId: null,
    certifiableAt: null,
    isCertifiable: null,
    updatedAt: new Date(),
  });
}

const get = async function (organizationLearnerId) {
  const organizationLearner = await knex
    .select('*')
    .from('view-active-organization-learners')
    .where({ id: organizationLearnerId })
    .first();

  if (!organizationLearner) {
    throw new NotFoundError(`Student not found for ID ${organizationLearnerId}`);
  }
  return new OrganizationLearner(organizationLearner);
};

const getLatestOrganizationLearner = async function ({ nationalStudentId, birthdate }) {
  const organizationLearner = await knex
    .where({ nationalStudentId, birthdate })
    .whereNotNull('userId')
    .select()
    .from('view-active-organization-learners')
    .orderBy('updatedAt', 'desc')
    .first();

  if (!organizationLearner) {
    throw new UserNotFoundError();
  }

  return organizationLearner;
};

const updateUserIdWhereNull = async function ({ organizationLearnerId, userId }) {
  const knexConn = DomainTransaction.getConnection();
  const [rawOrganizationLearner] = await knexConn('organization-learners')
    .where({ id: organizationLearnerId, userId: null })
    .update({ userId, updatedAt: knex.fn.now() })
    .returning('*');

  if (!rawOrganizationLearner)
    throw new OrganizationLearnerNotFound(
      `OrganizationLearner not found for ID ${organizationLearnerId} and user ID null.`,
    );

  return new OrganizationLearner(rawOrganizationLearner);
};

const isActive = async function ({ userId, campaignId }) {
  const learner = await knex('view-active-organization-learners')
    .select('view-active-organization-learners.isDisabled')
    .join('organizations', 'organizations.id', 'view-active-organization-learners.organizationId')
    .join('campaigns', 'campaigns.organizationId', 'organizations.id')
    .where({ 'campaigns.id': campaignId })
    .andWhere({ 'view-active-organization-learners.userId': userId })
    .first();
  return !learner?.isDisabled;
};

async function updateCertificability(organizationLearner) {
  const result = await knex('organization-learners').where({ id: organizationLearner.id }).update({
    isCertifiable: organizationLearner.isCertifiable,
    certifiableAt: organizationLearner.certifiableAt,
  });
  if (result === 0) {
    throw new OrganizationLearnerCertificabilityNotUpdatedError(
      `Could not update certificability for OrganizationLearner with ID ${organizationLearner.id}.`,
    );
  }
}

async function countByOrganizationsWhichNeedToComputeCertificability({
  skipLoggedLastDayCheck = false,
  onlyNotComputed = false,
  fromUserActivityDate,
  toUserActivityDate,
} = {}) {
  const queryBuilder = _queryBuilderForCertificability({
    fromUserActivityDate,
    toUserActivityDate,
    skipLoggedLastDayCheck,
    onlyNotComputed,
  });
  const [{ count }] = await queryBuilder.count('view-active-organization-learners.id');
  return count;
}

function findByOrganizationsWhichNeedToComputeCertificability({
  limit,
  offset,
  fromUserActivityDate,
  toUserActivityDate,
  skipLoggedLastDayCheck = false,
  onlyNotComputed = false,
} = {}) {
  const queryBuilder = _queryBuilderForCertificability({
    fromUserActivityDate,
    toUserActivityDate,
    skipLoggedLastDayCheck,
    onlyNotComputed,
  });

  return queryBuilder
    .orderBy('view-active-organization-learners.id', 'ASC')
    .modify(function (qB) {
      if (limit) {
        qB.limit(limit);
      }
      if (offset) {
        qB.offset(offset);
      }
    })
    .pluck('view-active-organization-learners.id');
}

function _queryBuilderForCertificability({
  fromUserActivityDate,
  toUserActivityDate,
  skipLoggedLastDayCheck,
  onlyNotComputed,
}) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('view-active-organization-learners')
    .join(
      'organization-features',
      'view-active-organization-learners.organizationId',
      '=',
      'organization-features.organizationId',
    )
    .join('features', 'organization-features.featureId', '=', 'features.id')
    .join('users', 'view-active-organization-learners.userId', '=', 'users.id')
    .where('features.key', '=', ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key)
    .where('view-active-organization-learners.isDisabled', false)
    .modify(function (queryBuilder) {
      if (!skipLoggedLastDayCheck) {
        queryBuilder.join('user-logins', function () {
          this.on('view-active-organization-learners.userId', 'user-logins.userId')
            .andOnVal('user-logins.lastLoggedAt', '>', fromUserActivityDate)
            .andOnVal('user-logins.lastLoggedAt', '<=', toUserActivityDate);
        });
      }
      if (skipLoggedLastDayCheck && onlyNotComputed) {
        queryBuilder.whereNull('view-active-organization-learners.isCertifiable');
      }
    });
}

/**
 * @function
 * @name findAllLearnerWithAtLeastOneParticipationByOrganizationId
 * @typedef {number} organizationId
 * @returns {Promise<ParticipantRepartition>}
 */
const findAllLearnerWithAtLeastOneParticipationByOrganizationId = async function (organizationId) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn
    .select('users.isAnonymous')
    .distinct('view-active-organization-learners.id')
    .from('view-active-organization-learners')
    .join('users', 'users.id', 'view-active-organization-learners.userId')
    .join('campaign-participations', function () {
      this.on('campaign-participations.organizationLearnerId', 'view-active-organization-learners.id').andOnVal(
        'campaign-participations.deletedAt',
        knex.raw('IS'),
        knex.raw('NULL'),
      );
    })
    .where({ organizationId });

  return new ParticipantRepartition(result);
};

const findAllLearnerWithAtLeastOneParticipationByOrganizationIds = async function (organizationIds) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn
    .select('users.isAnonymous', 'view-active-organization-learners.organizationId')
    .distinct('view-active-organization-learners.id')
    .from('view-active-organization-learners')
    .join('users', 'users.id', 'view-active-organization-learners.userId')
    .join('campaign-participations', function () {
      this.on('campaign-participations.organizationLearnerId', 'view-active-organization-learners.id').andOnVal(
        'campaign-participations.deletedAt',
        knex.raw('IS'),
        knex.raw('NULL'),
      );
    })
    .whereIn('organizationId', organizationIds);

  const resultByOrganization = {};

  organizationIds.forEach((organizationId) => {
    const participants = results.filter((result) => result.organizationId === organizationId);
    resultByOrganization[organizationId] = new ParticipantRepartition(participants);
  });

  return resultByOrganization;
};

export {
  _reconcileOrganizationLearners,
  countByOrganizationsWhichNeedToComputeCertificability,
  dissociateAllStudentsByUserId,
  findAllLearnerWithAtLeastOneParticipationByOrganizationId,
  findAllLearnerWithAtLeastOneParticipationByOrganizationIds,
  findByIds,
  findByOrganizationId,
  findByOrganizationIdAndBirthdate,
  findByOrganizationIdAndUpdatedAtOrderByDivision,
  findByOrganizationsWhichNeedToComputeCertificability,
  findByUserId,
  get,
  getLatestOrganizationLearner,
  isActive,
  reconcileUserToOrganizationLearner,
  updateCertificability,
  updateUserIdWhereNull,
};
