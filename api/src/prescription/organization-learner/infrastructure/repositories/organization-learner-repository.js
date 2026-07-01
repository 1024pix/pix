import {
  NotFoundError,
  OrganizationLearnerNotFound,
  UserNotFoundError,
} from '../../../../../src/shared/domain/errors.js';
import { ORGANIZATION_FEATURE } from '../../../../shared/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { filterByFullName } from '../../../../shared/infrastructure/utils/filter-utils.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { OrganizationLearner as OrganizationLearnerToManage } from '../../../learner-management/domain/models/OrganizationLearner.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../shared/domain/constants.js';
import { ParticipantRepartition } from '../../domain/models/ParticipantRepartition.js';
import { AttestationParticipantStatus } from '../../domain/read-models/AttestationParticipantStatus.js';
import { OrganizationLearner } from '../../domain/read-models/OrganizationLearner.js';
import { OrganizationLearnerOverviewForAdmin } from '../../domain/read-models/OrganizationLearnerOverviewForAdmin.js';

function _buildIsCertifiable(queryBuilder, organizationLearnerId, knexConn) {
  queryBuilder
    .distinct('view-active-organization-learners.id')
    .select(
      'view-active-organization-learners.id as organizationLearnerId',
      knexConn.raw(
        'FIRST_VALUE("campaign-participations"."isCertifiable") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "isCertifiableFromCampaign"',
      ),
      knexConn.raw(
        'FIRST_VALUE("campaign-participations"."sharedAt") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "certifiableAtFromCampaign"',
      ),
    )
    .from('view-active-organization-learners')
    .join(
      'campaign-participations',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.status', CampaignParticipationStatuses.SHARED)
    .where('campaigns.type', CampaignTypes.PROFILES_COLLECTION)
    .where('view-active-organization-learners.id', organizationLearnerId)
    .where('campaign-participations.deletedAt', null);
}

async function get({ organizationLearnerId }) {
  const knexConn = DomainTransaction.getConnection();
  const row = await knexConn
    .with('subquery', (qb) => _buildIsCertifiable(qb, organizationLearnerId, knexConn))
    .select(
      'view-active-organization-learners.id',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
      'view-active-organization-learners.division',
      'view-active-organization-learners.group',
      'view-active-organization-learners.organizationId',
      'view-active-organization-learners.attributes',
      'view-active-organization-learners.isCertifiable as isCertifiableFromLearner',
      'view-active-organization-learners.certifiableAt as certifiableAtFromLearner',
      'subquery.isCertifiableFromCampaign',
      'subquery.certifiableAtFromCampaign',
      knexConn.raw('array_remove(ARRAY_AGG("identityProvider"), NULL) AS "authenticationMethods"'),
      knexConn.raw('array_remove(ARRAY_AGG(features.key), NULL) as features'),
      'users.email',
      'users.username',
      'users.id AS userId',
    )
    .from('view-active-organization-learners')
    .where('view-active-organization-learners.id', organizationLearnerId)
    .leftJoin('subquery', 'subquery.organizationLearnerId', 'view-active-organization-learners.id')
    .leftJoin('authentication-methods', 'authentication-methods.userId', 'view-active-organization-learners.userId')
    .leftJoin('users', 'view-active-organization-learners.userId', 'users.id')
    .leftJoin(
      'organization-learner-features',
      'view-active-organization-learners.id',
      'organization-learner-features.organizationLearnerId',
    )
    .leftJoin('features', 'organization-learner-features.featureId', 'features.id')
    .groupBy(
      'view-active-organization-learners.id',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
      'view-active-organization-learners.division',
      'view-active-organization-learners.group',
      'view-active-organization-learners.organizationId',
      'view-active-organization-learners.attributes',
      'users.id',
      'subquery.isCertifiableFromCampaign',
      'subquery.certifiableAtFromCampaign',
      'view-active-organization-learners.isCertifiable',
      'view-active-organization-learners.certifiableAt',
    )
    .first();
  if (row) {
    return new OrganizationLearner(row);
  }
  throw new NotFoundError(`Student not found for ID ${organizationLearnerId}`);
}

async function findPaginatedLearnersByOrganizationId({ organizationId, page, filter }) {
  const knexConn = DomainTransaction.getConnection();

  const query = knexConn
    .select('id', 'userId', 'firstName', 'lastName', 'organizationId', 'division', 'attributes')
    .from('view-active-organization-learners')
    .where({ isDisabled: false, organizationId })
    .orderByRaw('LOWER("firstName") ASC')
    .orderByRaw('LOWER("lastName") ASC');

  if (filter) {
    const { name, divisions, ...attributesToFilter } = filter;
    Object.entries(attributesToFilter)
      .filter(([_, values]) => values !== undefined)
      .forEach(([name, values]) => {
        query.andWhere(function () {
          // eslint-disable-next-line knex/avoid-injections
          this.whereRaw(`attributes->>'${name}' in ( ${values.map((_) => '?').join(' , ')} )`, values);
        });
      });
    if (name) {
      filterByFullName(query, name, 'firstName', 'lastName');
    }
    if (divisions?.length > 0) {
      query.whereIn('division', divisions);
    }
  }

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });

  const learners = results.map((learner) => new OrganizationLearner(learner));

  return { learners, pagination };
}

async function findPaginatedLearnersForAdmin({ page, filter }) {
  const knexConn = DomainTransaction.getConnection();

  const query = knexConn
    .select(
      'view-active-organization-learners.id as id',
      'firstName',
      'lastName',
      'birthdate',
      'division',
      'group',
      'nationalStudentId',
      'userId',
      'organizationId',
      'organizations.name as organizationName',
      'view-active-organization-learners.updatedAt as updatedAt',
      'isDisabled',
    )
    .from('view-active-organization-learners')
    .innerJoin('organizations', 'organizations.id', 'view-active-organization-learners.organizationId')
    .orderByRaw('LOWER("firstName") ASC')
    .orderByRaw('LOWER("lastName") ASC');

  if (filter) {
    const { fullName, organizationId } = filter;
    if (fullName) {
      filterByFullName(query, fullName, 'firstName', 'lastName');
    }
    if (organizationId) {
      query.where({ organizationId });
    }
  }

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });

  const learners = results.map((learner) => new OrganizationLearnerOverviewForAdmin(learner));

  return { learners, pagination };
}

async function findUserIdsFromFilters({ organizationId, filters = {} }) {
  const knexConnection = DomainTransaction.getConnection();
  const queryBuilder = knexConnection('view-active-organization-learners')
    .select('userId')
    .where({ organizationId, isDisabled: false })
    .whereNotNull('userId')
    .pluck('userId');

  if (filters?.divisions?.length > 0) {
    return queryBuilder.whereIn('division', filters.divisions);
  } else {
    return queryBuilder;
  }
}

async function getAttestationsForOrganizationLearnersAndKey({
  attestationKey,
  userIds,
  organizationId,
  attestationsApi,
}) {
  return attestationsApi.generateAttestations({
    attestationKey,
    userIds,
    organizationId,
  });
}

async function findPaginatedAttestationStatusForOrganizationLearnersAndKey({
  attestationKey,
  organizationId,
  filter,
  page,
  attestationsApi,
}) {
  const knexConn = DomainTransaction.getConnection();

  const query = knexConn
    .select(
      'view-active-organization-learners.id',
      'userId',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
      'organizationId',
      'division',
      'attributes',
    )
    .from('view-active-organization-learners')
    .join('users', 'users.id', 'view-active-organization-learners.userId')
    .where({ isDisabled: false, organizationId, isAnonymous: false, hasBeenAnonymised: false })
    .orderByRaw('LOWER("view-active-organization-learners"."lastName") ASC')
    .orderByRaw('LOWER("view-active-organization-learners"."firstName") ASC');

  if (filter) {
    const { name, divisions } = filter;
    if (name) {
      filterByFullName(
        query,
        name,
        'view-active-organization-learners.firstName',
        'view-active-organization-learners.lastName',
      );
    }
    if (divisions?.length > 0) {
      query.whereIn('division', divisions);
    }
  }

  const organizationLearners = await query;
  const attestations = await attestationsApi.getAttestationsUserDetail({
    attestationKey,
    organizationId,
  });

  let attestationParticipantsStatus = organizationLearners.map((organizationLearner) =>
    _toAttestationParticipantStatus(organizationLearner, attestationKey, attestations),
  );

  if (filter?.statuses?.length > 0) {
    attestationParticipantsStatus = attestationParticipantsStatus.filter((attestationParticipantStatus) =>
      _filterByStatuses(attestationParticipantStatus, filter.statuses),
    );
  }

  const { results, pagination } = _getPage(attestationParticipantsStatus, page);
  return {
    attestationParticipantsStatus: results,
    pagination,
  };
}

function _toAttestationParticipantStatus(organizationLearner, attestationKey, attestations) {
  const attestation = attestations.find(({ userId }) => userId === organizationLearner.userId);
  return new AttestationParticipantStatus({
    attestationKey,
    organizationLearnerId: organizationLearner.id,
    obtainedAt: attestation?.createdAt,
    ...attestation,
    ...organizationLearner,
  });
}

function _filterByStatuses(attestationParticipantStatus, filterStatuses) {
  const isFilteredByObtained = filterStatuses.includes('OBTAINED') && Boolean(attestationParticipantStatus.obtainedAt);
  const isFilteredByNotObtained = filterStatuses.includes('NOT_OBTAINED') && !attestationParticipantStatus.obtainedAt;
  return isFilteredByObtained || isFilteredByNotObtained;
}

function _getPage(results, page = { number: 1, size: 10 }) {
  const pageNumber = page.number ?? 1;
  const pageSize = page.size ?? 10;
  const start = (pageNumber - 1) * pageSize;
  const end = pageNumber * pageSize;
  return {
    results: results.slice(start, end),
    pagination: {
      page: pageNumber,
      pageCount: Math.ceil(results.length / pageSize),
      pageSize,
      rowCount: results.length,
    },
  };
}

async function findIdByUserIdAndOrganizationId({ organizationId, userId }) {
  if (!organizationId || !userId) return null;

  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('view-active-organization-learners')
    .where('organizationId', organizationId)
    .andWhere('userId', userId)
    .first('id');

  return result?.id || null;
}

const findByIds = async function ({ ids }) {
  const knexConn = DomainTransaction.getConnection();

  const rawOrganizationLearners = await knexConn
    .select('*')
    .from('view-active-organization-learners')
    .whereIn('id', ids)
    .orderBy('id');

  return rawOrganizationLearners.map(
    (rawOrganizationLearner) => new OrganizationLearnerToManage(rawOrganizationLearner),
  );
};

const findByOrganizationIdAndUpdatedAtOrderByDivision = async function ({ organizationId, page, filter }) {
  const BEGINNING_OF_THE_2020_SCHOOL_YEAR = '2020-08-15';

  const knexConn = DomainTransaction.getConnection();

  const query = knexConn('view-active-organization-learners')
    .where({
      organizationId,
      isDisabled: false,
    })
    .where('updatedAt', '>', BEGINNING_OF_THE_2020_SCHOOL_YEAR)
    .orderByRaw('LOWER("division") ASC, LOWER("lastName") ASC, LOWER("firstName") ASC');

  if (filter.divisions) {
    query.whereIn('division', filter.divisions);
  }

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });

  return {
    data: results.map((result) => new OrganizationLearnerToManage(result)),
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

  return rawOrganizationLearners.map(
    (rawOrganizationLearner) => new OrganizationLearnerToManage(rawOrganizationLearner),
  );
};

const findByOrganizationIdAndBirthdate = async function ({ organizationId, birthdate }) {
  const knexConn = DomainTransaction.getConnection();

  const rawOrganizationLearners = await knexConn
    .select('*')
    .from('view-active-organization-learners')
    .where({ organizationId, birthdate, isDisabled: false })
    .orderBy('id');

  return rawOrganizationLearners.map(
    (rawOrganizationLearner) => new OrganizationLearnerToManage(rawOrganizationLearner),
  );
};

const getLatestOrganizationLearner = async function ({ nationalStudentId, birthdate }) {
  const knexConn = DomainTransaction.getConnection();

  const organizationLearner = await knexConn
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
    .update({ userId, updatedAt: new Date() })
    .returning('*');

  if (!rawOrganizationLearner)
    throw new OrganizationLearnerNotFound(
      `OrganizationLearner not found for ID ${organizationLearnerId} and user ID null.`,
    );

  return new OrganizationLearner(rawOrganizationLearner);
};

const isActive = async function ({ userId, campaignId }) {
  const knexConn = DomainTransaction.getConnection();

  const learner = await knexConn('view-active-organization-learners')
    .select('view-active-organization-learners.isDisabled')
    .join('organizations', 'organizations.id', 'view-active-organization-learners.organizationId')
    .join('campaigns', 'campaigns.organizationId', 'organizations.id')
    .where({ 'campaigns.id': campaignId })
    .andWhere({ 'view-active-organization-learners.userId': userId })
    .first();
  return !learner?.isDisabled;
};

async function countByOrganizationsWhichNeedToComputeCertificability({
  skipActivityDate = false,
  onlyNotComputed = false,
  fromUserActivityDate,
  toUserActivityDate,
} = {}) {
  const queryBuilder = _queryBuilderForCertificability({
    fromUserActivityDate,
    toUserActivityDate,
    skipActivityDate,
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
  skipActivityDate = false,
  onlyNotComputed = false,
} = {}) {
  const queryBuilder = _queryBuilderForCertificability({
    fromUserActivityDate,
    toUserActivityDate,
    skipActivityDate,
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
  skipActivityDate,
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
      if (!skipActivityDate) {
        queryBuilder.join('user-logins', function () {
          this.on('view-active-organization-learners.userId', 'user-logins.userId')
            .andOnVal('user-logins.lastLoggedAt', '>', fromUserActivityDate)
            .andOnVal('user-logins.lastLoggedAt', '<=', toUserActivityDate);
        });
      }
      if (onlyNotComputed) {
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
        knexConn.raw('IS'),
        knexConn.raw('NULL'),
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
        knexConn.raw('IS'),
        knexConn.raw('NULL'),
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
  countByOrganizationsWhichNeedToComputeCertificability,
  findAllLearnerWithAtLeastOneParticipationByOrganizationId,
  findAllLearnerWithAtLeastOneParticipationByOrganizationIds,
  findByIds,
  findByOrganizationIdAndBirthdate,
  findByOrganizationIdAndUpdatedAtOrderByDivision,
  findByOrganizationsWhichNeedToComputeCertificability,
  findByUserId,
  findIdByUserIdAndOrganizationId,
  findPaginatedAttestationStatusForOrganizationLearnersAndKey,
  findPaginatedLearnersByOrganizationId,
  findPaginatedLearnersForAdmin,
  findUserIdsFromFilters,
  get,
  getAttestationsForOrganizationLearnersAndKey,
  getLatestOrganizationLearner,
  isActive,
  updateUserIdWhereNull,
};
