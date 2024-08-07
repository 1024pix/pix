import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } from '../../../../../db/pgsql-errors.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  CertificationCandidateCreationOrUpdateError,
  CertificationCandidateMultipleUserLinksWithinSessionError,
  NotFoundError,
} from '../../../../shared/domain/errors.js';
import { CertificationCandidate } from '../../../../shared/domain/models/index.js';
import { BookshelfCertificationCandidate } from '../../../../shared/infrastructure/orm-models/CertificationCandidate.js';
import * as bookshelfToDomainConverter from '../../../../shared/infrastructure/utils/bookshelf-to-domain-converter.js';
import { normalize } from '../../../../shared/infrastructure/utils/string-utils.js';
import { CompanionPingInfo } from '../../domain/models/CompanionPingInfo.js';
import { ComplementaryCertification } from '../../domain/models/ComplementaryCertification.js';
import { Subscription } from '../../domain/models/Subscription.js';

const linkToUser = async function ({ id, userId }) {
  try {
    const certificationCandidateBookshelf = new BookshelfCertificationCandidate({ id });
    await certificationCandidateBookshelf.save({ userId }, { patch: true, method: 'update' });
  } catch (bookshelfError) {
    if (bookshelfError.code === PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR) {
      throw new CertificationCandidateMultipleUserLinksWithinSessionError(
        'A user cannot be linked to several certification candidates within the same session',
      );
    }
    throw new CertificationCandidateCreationOrUpdateError(
      'An error occurred while linking the certification candidate to a user',
    );
  }
};

const getBySessionIdAndUserId = async function ({ sessionId, userId }) {
  const certificationCandidate = await _candidateBaseQuery().where({ sessionId, userId }).first();
  return certificationCandidate ? _toDomain(certificationCandidate) : undefined;
};

const findBySessionId = async function (sessionId) {
  const results = await _candidateBaseQuery()
    .where({ 'certification-candidates.sessionId': sessionId })
    .orderByRaw('LOWER("certification-candidates"."lastName") asc')
    .orderByRaw('LOWER("certification-candidates"."firstName") asc');
  return results.map(_toDomain);
};

const findBySessionIdAndPersonalInfo = async function ({ sessionId, firstName, lastName, birthdate }) {
  const results = await _candidateBaseQuery().where({ sessionId, birthdate });
  const certificationCandidates = results.map(_toDomain);

  const normalizedInputNames = {
    lastName: normalize(lastName),
    firstName: normalize(firstName),
  };
  return _.filter(certificationCandidates, (certificationCandidate) => {
    const certificationCandidateNormalizedNames = {
      lastName: normalize(certificationCandidate.lastName),
      firstName: normalize(certificationCandidate.firstName),
    };
    return _.isEqual(normalizedInputNames, certificationCandidateNormalizedNames);
  });
};

const findOneBySessionIdAndUserId = function ({ sessionId, userId }) {
  return BookshelfCertificationCandidate.where({ sessionId, userId })
    .fetchAll()
    .then((results) => _buildCertificationCandidates(results)[0]);
};

const update = async function (certificationCandidate) {
  const result = await knex('certification-candidates')
    .where({ id: certificationCandidate.id })
    .update({ authorizedToStart: certificationCandidate.authorizedToStart });

  if (result === 0) {
    throw new NotFoundError('Aucun candidat trouvé');
  }
};

const getWithComplementaryCertification = async function ({ id }) {
  const candidateData = await _candidateBaseQuery().where('certification-candidates.id', id).first();

  if (!candidateData) {
    throw new NotFoundError('Candidate not found');
  }

  return _toDomain(candidateData);
};

const findCompanionPingInfoByUserId = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();

  const latestCertificationCourse = await knexConn
    .select('sessionId', 'completedAt', 'endedAt')
    .from('certification-courses')
    .where({ userId })
    .orderBy('createdAt', 'desc')
    .first();

  if (latestCertificationCourse && !latestCertificationCourse.completedAt && !latestCertificationCourse.endedAt) {
    const { sessionId } = latestCertificationCourse;
    const { id: certificationCandidateId } = await knexConn
      .select('id')
      .from('certification-candidates')
      .where({ sessionId, userId })
      .first();

    return new CompanionPingInfo({ sessionId, certificationCandidateId });
  }

  throw new NotFoundError(`User ${userId} is not in a certification’s session`);
};

export {
  findBySessionId,
  findBySessionIdAndPersonalInfo,
  findCompanionPingInfoByUserId,
  findOneBySessionIdAndUserId,
  getBySessionIdAndUserId,
  getWithComplementaryCertification,
  linkToUser,
  update,
};

function _buildCertificationCandidates(results) {
  if (results?.models[0]) {
    results.models.forEach((model, index) => {
      results.models[index].attributes.organizationLearnerId = model.attributes.organizationLearnerId;
    });
  }

  return bookshelfToDomainConverter.buildDomainObjects(BookshelfCertificationCandidate, results);
}

/**
 * @deprecated migration: new ComplementaryCertification(...) should not be done here
 * it should come from internal API complementary-certification bounded context.
 * Please beware of that when refactoring this code in the future
 */
function _toDomain(candidateData) {
  return new CertificationCandidate({
    ...candidateData,
    subscriptions: [Subscription.buildCore({ id: candidateData.certificationCandidateId })],
    complementaryCertification: candidateData.complementaryCertificationId
      ? new ComplementaryCertification({
          id: candidateData.complementaryCertificationId,
          key: candidateData.complementaryCertificationKey,
          label: candidateData.complementaryCertificationLabel,
        })
      : null,
  });
}

function _candidateBaseQuery() {
  return knex
    .select({
      certificationCandidate: 'certification-candidates.*',
      complementaryCertificationId: 'complementary-certifications.id',
      complementaryCertificationKey: 'complementary-certifications.key',
      complementaryCertificationLabel: 'complementary-certifications.label',
    })
    .from('certification-candidates')
    .leftJoin('certification-subscriptions', (builder) =>
      builder
        .on('certification-candidates.id', '=', 'certification-subscriptions.certificationCandidateId')
        .onNotNull('certification-subscriptions.complementaryCertificationId'),
    )
    .leftJoin(
      'complementary-certifications',
      'certification-subscriptions.complementaryCertificationId',
      'complementary-certifications.id',
    )
    .groupBy('certification-candidates.id', 'complementary-certifications.id');
}
