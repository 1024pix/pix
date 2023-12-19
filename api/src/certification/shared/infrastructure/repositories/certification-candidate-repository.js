import _ from 'lodash';
import { normalize } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { logger } from '../../../../../src/shared/infrastructure/utils/logger.js';
import { BookshelfCertificationCandidate } from '../../../../../lib/infrastructure/orm-models/CertificationCandidate.js';
import * as bookshelfToDomainConverter from '../../../../../lib/infrastructure/utils/bookshelf-to-domain-converter.js';
import { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } from '../../../../../db/pgsql-errors.js';

import {
  NotFoundError,
  CertificationCandidateCreationOrUpdateError,
  CertificationCandidateMultipleUserLinksWithinSessionError,
} from '../../../../../lib/domain/errors.js';

import { knex } from '../../../../../db/knex-database-connection.js';
import { CertificationCandidate } from '../../../../../lib/domain/models/CertificationCandidate.js';
import { ComplementaryCertification } from '../../../complementary-certification/domain/models/ComplementaryCertification.js';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';

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

const saveInSession = async function ({
  certificationCandidate,
  sessionId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const certificationCandidateDataToSave = _adaptModelToDb(certificationCandidate);

  try {
    const insertCertificationCandidateQuery = knex('certification-candidates')
      .insert({ ...certificationCandidateDataToSave, sessionId })
      .returning('*');

    if (domainTransaction.knexTransaction) {
      insertCertificationCandidateQuery.transacting(domainTransaction.knexTransaction);
    }

    const [addedCertificationCandidate] = await insertCertificationCandidateQuery;

    if (certificationCandidate.complementaryCertification) {
      const complementaryCertificationSubscriptionToSave = {
        complementaryCertificationId: certificationCandidate.complementaryCertification.id,
        certificationCandidateId: addedCertificationCandidate.id,
      };

      const insertComplementaryCertificationSubscriptionQuery = knex(
        'complementary-certification-subscriptions',
      ).insert(complementaryCertificationSubscriptionToSave);

      if (domainTransaction.knexTransaction) {
        insertComplementaryCertificationSubscriptionQuery.transacting(domainTransaction.knexTransaction);
      }

      await insertComplementaryCertificationSubscriptionQuery;
    }

    return new CertificationCandidate(addedCertificationCandidate);
  } catch (error) {
    logger.error(error);
    throw new CertificationCandidateCreationOrUpdateError(
      'An error occurred while saving the certification candidate in a session',
    );
  }
};

const remove = async function (certificationCandidateId) {
  await knex.transaction(async (trx) => {
    await trx('complementary-certification-subscriptions').where({ certificationCandidateId }).del();
    return trx('certification-candidates').where({ id: certificationCandidateId }).del();
  });

  return true;
};

const isNotLinked = async function (certificationCandidateId) {
  const notLinkedCandidate = await BookshelfCertificationCandidate.where({
    id: certificationCandidateId,
    userId: null,
  }).fetch({ require: false, columns: ['id'] });

  return !!notLinkedCandidate;
};

const getBySessionIdAndUserId = async function ({ sessionId, userId }) {
  const certificationCandidate = await knex
    .select({
      certificationCandidate: 'certification-candidates.*',
      complementaryCertificationId: 'complementary-certifications.id',
      complementaryCertificationKey: 'complementary-certifications.key',
      complementaryCertificationLabel: 'complementary-certifications.label',
    })
    .from('certification-candidates')
    .leftJoin(
      'complementary-certification-subscriptions',
      'certification-candidates.id',
      'complementary-certification-subscriptions.certificationCandidateId',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certification-subscriptions.complementaryCertificationId',
      'complementary-certifications.id',
    )
    .where({ sessionId, userId })
    .groupBy('certification-candidates.id', 'complementary-certifications.id')
    .first();
  return certificationCandidate ? _toDomain(certificationCandidate) : undefined;
};

const findBySessionId = async function (sessionId) {
  const results = await knex
    .select({
      certificationCandidate: 'certification-candidates.*',
      complementaryCertificationId: 'complementary-certifications.id',
      complementaryCertificationKey: 'complementary-certifications.key',
      complementaryCertificationLabel: 'complementary-certifications.label',
    })
    .from('certification-candidates')
    .where({ 'certification-candidates.sessionId': sessionId })
    .leftJoin(
      'complementary-certification-subscriptions',
      'certification-candidates.id',
      'complementary-certification-subscriptions.certificationCandidateId',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certification-subscriptions.complementaryCertificationId',
      'complementary-certifications.id',
    )
    .groupBy('certification-candidates.id', 'complementary-certifications.id')
    .orderByRaw('LOWER("certification-candidates"."lastName") asc')
    .orderByRaw('LOWER("certification-candidates"."firstName") asc');
  return results.map(_toDomain);
};

const findBySessionIdAndPersonalInfo = async function ({ sessionId, firstName, lastName, birthdate }) {
  const results = await BookshelfCertificationCandidate.where({ sessionId, birthdate }).fetchAll();

  const certificationCandidates = _buildCertificationCandidates(results);

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

const doesLinkedCertificationCandidateInSessionExist = async function ({ sessionId }) {
  const anyLinkedCandidateInSession = await BookshelfCertificationCandidate.query({
    where: { sessionId },
    whereNotNull: 'userId',
  }).fetch({ require: false, columns: 'id' });

  return anyLinkedCandidateInSession !== null;
};

const update = async function (certificationCandidate) {
  const result = await knex('certification-candidates')
    .where({ id: certificationCandidate.id })
    .update({ authorizedToStart: certificationCandidate.authorizedToStart });

  if (result === 0) {
    throw new NotFoundError('Aucun candidat trouvé');
  }
};

const deleteBySessionId = async function ({ sessionId, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction.knexTransaction ?? knex;
  await knexConn('complementary-certification-subscriptions')
    .whereIn('certificationCandidateId', knexConn.select('id').from('certification-candidates').where({ sessionId }))
    .del();

  await knexConn('certification-candidates').where({ sessionId }).del();
};

const getWithComplementaryCertification = async function (id) {
  const candidateData = await knex('certification-candidates')
    .select({
      certificationCandidate: 'certification-candidates.*',
      complementaryCertificationId: 'complementary-certifications.id',
      complementaryCertificationKey: 'complementary-certifications.key',
      complementaryCertificationLabel: 'complementary-certifications.label',
    })
    .leftJoin(
      'complementary-certification-subscriptions',
      'complementary-certification-subscriptions.certificationCandidateId',
      'certification-candidates.id',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-subscriptions.complementaryCertificationId',
    )
    .where('certification-candidates.id', id)
    .first();

  if (!candidateData) {
    throw new NotFoundError('Candidate not found');
  }

  return _toDomain(candidateData);
};

export {
  linkToUser,
  saveInSession,
  remove,
  isNotLinked,
  getBySessionIdAndUserId,
  findBySessionId,
  findBySessionIdAndPersonalInfo,
  findOneBySessionIdAndUserId,
  doesLinkedCertificationCandidateInSessionExist,
  update,
  deleteBySessionId,
  getWithComplementaryCertification,
};

function _buildCertificationCandidates(results) {
  if (results?.models[0]) {
    results.models.forEach((model, index) => {
      results.models[index].attributes.organizationLearnerId = model.attributes.organizationLearnerId;
    });
  }

  return bookshelfToDomainConverter.buildDomainObjects(BookshelfCertificationCandidate, results);
}

function _adaptModelToDb(certificationCandidateToSave) {
  return {
    authorizedToStart: certificationCandidateToSave.authorizedToStart,
    billingMode: certificationCandidateToSave.billingMode,
    birthCity: certificationCandidateToSave.birthCity,
    birthCountry: certificationCandidateToSave.birthCountry,
    birthINSEECode: certificationCandidateToSave.birthINSEECode,
    birthPostalCode: certificationCandidateToSave.birthPostalCode,
    birthProvinceCode: certificationCandidateToSave.birthProvinceCode,
    birthdate: certificationCandidateToSave.birthdate,
    email: certificationCandidateToSave.email,
    externalId: certificationCandidateToSave.externalId,
    extraTimePercentage: certificationCandidateToSave.extraTimePercentage,
    firstName: certificationCandidateToSave.firstName,
    lastName: certificationCandidateToSave.lastName,
    prepaymentCode: certificationCandidateToSave.prepaymentCode,
    resultRecipientEmail: certificationCandidateToSave.resultRecipientEmail,
    organizationLearnerId: certificationCandidateToSave.organizationLearnerId,
    sex: certificationCandidateToSave.sex,
  };
}

function _toDomain(candidateData) {
  /**
   * Note migration: new ComplementaryCertification(...) should not be done here
   * it should come from internal API complementary-certification bounded context.
   * Please beware of that when migrating this repository to src folder
   */
  return new CertificationCandidate({
    ...candidateData,
    complementaryCertification: candidateData.complementaryCertificationId
      ? new ComplementaryCertification({
          id: candidateData.complementaryCertificationId,
          key: candidateData.complementaryCertificationKey,
          label: candidateData.complementaryCertificationLabel,
        })
      : null,
  });
}
