import _ from 'lodash';
import { normalize } from '../utils/string-utils.js';
import { logger } from '../../infrastructure/logger.js';
import { CertificationCandidateBookshelf } from '../orm-models/CertificationCandidate.js';
import * as bookshelfToDomainConverter from '../../infrastructure/utils/bookshelf-to-domain-converter.js';
import { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } from '../../../db/pgsql-errors.js';

import {
  NotFoundError,
  CertificationCandidateCreationOrUpdateError,
  CertificationCandidateMultipleUserLinksWithinSessionError,
} from '../../domain/errors.js';

import { knex } from '../../../db/knex-database-connection.js';
import { CertificationCandidate } from '../../domain/models/CertificationCandidate.js';
import { ComplementaryCertification } from '../../domain/models/ComplementaryCertification.js';
import { DomainTransaction } from '../DomainTransaction.js';

const linkToUser = async function ({ id, userId }) {
  try {
    const certificationCandidateBookshelf = new CertificationCandidateBookshelf({ id });
    await certificationCandidateBookshelf.save({ userId }, { patch: true, method: 'update' });
  } catch (bookshelfError) {
    if (bookshelfError.code === PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR) {
      throw new CertificationCandidateMultipleUserLinksWithinSessionError(
        'A user cannot be linked to several certification candidates within the same session'
      );
    }
    throw new CertificationCandidateCreationOrUpdateError(
      'An error occurred while linking the certification candidate to a user'
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

    if (!_.isEmpty(certificationCandidate.complementaryCertifications)) {
      const complementaryCertificationSubscriptionsToSave = certificationCandidate.complementaryCertifications.map(
        (complementaryCertification) => {
          return {
            complementaryCertificationId: complementaryCertification.id,
            certificationCandidateId: addedCertificationCandidate.id,
          };
        }
      );

      const insertComplementaryCertificationSubscriptionQuery = knex(
        'complementary-certification-subscriptions'
      ).insert(complementaryCertificationSubscriptionsToSave);

      if (domainTransaction.knexTransaction) {
        insertComplementaryCertificationSubscriptionQuery.transacting(domainTransaction.knexTransaction);
      }

      await insertComplementaryCertificationSubscriptionQuery;
    }

    return new CertificationCandidate(addedCertificationCandidate);
  } catch (error) {
    logger.error(error);
    throw new CertificationCandidateCreationOrUpdateError(
      'An error occurred while saving the certification candidate in a session'
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
  const notLinkedCandidate = await CertificationCandidateBookshelf.where({
    id: certificationCandidateId,
    userId: null,
  }).fetch({ require: false, columns: ['id'] });

  return !!notLinkedCandidate;
};

const getBySessionIdAndUserId = async function ({ sessionId, userId }) {
  const certificationCandidate = await knex
    .select('certification-candidates.*')
    .select({ complementaryCertifications: knex.raw(`json_agg("complementary-certifications".*)`) })
    .from('certification-candidates')
    .leftJoin(
      'complementary-certification-subscriptions',
      'certification-candidates.id',
      'complementary-certification-subscriptions.certificationCandidateId'
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certification-subscriptions.complementaryCertificationId',
      'complementary-certifications.id'
    )
    .where({ sessionId, userId })
    .groupBy('certification-candidates.id')
    .first();
  return certificationCandidate ? _toDomain(certificationCandidate) : undefined;
};

const findBySessionId = async function (sessionId) {
  const results = await knex
    .select('certification-candidates.*')
    .select({ complementaryCertifications: knex.raw(`json_agg("complementary-certifications".*)`) })
    .from('certification-candidates')
    .where({ 'certification-candidates.sessionId': sessionId })
    .leftJoin(
      'complementary-certification-subscriptions',
      'certification-candidates.id',
      'complementary-certification-subscriptions.certificationCandidateId'
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certification-subscriptions.complementaryCertificationId',
      'complementary-certifications.id'
    )
    .groupBy('certification-candidates.id')
    .orderByRaw('LOWER("certification-candidates"."lastName") asc')
    .orderByRaw('LOWER("certification-candidates"."firstName") asc');
  return results.map(_toDomain);
};

const findBySessionIdAndPersonalInfo = async function ({ sessionId, firstName, lastName, birthdate }) {
  const results = await CertificationCandidateBookshelf.where({ sessionId, birthdate }).fetchAll();

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
  return CertificationCandidateBookshelf.where({ sessionId, userId })
    .fetchAll()
    .then((results) => _buildCertificationCandidates(results)[0]);
};

const doesLinkedCertificationCandidateInSessionExist = async function ({ sessionId }) {
  const anyLinkedCandidateInSession = await CertificationCandidateBookshelf.query({
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

const getWithComplementaryCertifications = async function (id) {
  const candidateData = await knex('certification-candidates')
    .select('certification-candidates.*')
    .select({ complementaryCertifications: knex.raw('json_agg("complementary-certifications".*)') })
    .leftJoin(
      'complementary-certification-subscriptions',
      'complementary-certification-subscriptions.certificationCandidateId',
      'certification-candidates.id'
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-subscriptions.complementaryCertificationId'
    )
    .where('certification-candidates.id', id)
    .groupBy('certification-candidates.id')
    .first();
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
  getWithComplementaryCertifications,
};

function _buildCertificationCandidates(results) {
  if (results?.models[0]) {
    results.models.forEach((model, index) => {
      results.models[index].attributes.organizationLearnerId = model.attributes.organizationLearnerId;
    });
  }

  return bookshelfToDomainConverter.buildDomainObjects(CertificationCandidateBookshelf, results);
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
  const complementaryCertifications = candidateData.complementaryCertifications
    .filter((certificationData) => certificationData !== null)
    .map((certification) => new ComplementaryCertification(certification));

  return new CertificationCandidate({
    ...candidateData,
    complementaryCertifications,
  });
}
