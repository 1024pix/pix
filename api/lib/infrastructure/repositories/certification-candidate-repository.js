const _ = require('lodash');
const { normalize } = require('../utils/string-utils');
const CertificationCandidateBookshelf = require('../orm-models/CertificationCandidate');
const bookshelfToDomainConverter = require('../../infrastructure/utils/bookshelf-to-domain-converter');
const { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } = require('../../../db/pgsql-errors');
const {
  NotFoundError,
  CertificationCandidateCreationOrUpdateError,
  CertificationCandidateMultipleUserLinksWithinSessionError,
} = require('../../domain/errors');
const { knex } = require('../../../db/knex-database-connection');
const CertificationCandidate = require('../../domain/models/CertificationCandidate');
const ComplementaryCertification = require('../../domain/models/ComplementaryCertification');
const DomainTransaction = require('../DomainTransaction');

module.exports = {
  async linkToUser({ id, userId }) {
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
  },

  async saveInSession({ certificationCandidate, sessionId, domainTransaction = DomainTransaction.emptyTransaction() }) {
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
      throw new CertificationCandidateCreationOrUpdateError(
        'An error occurred while saving the certification candidate in a session'
      );
    }
  },

  async delete(certificationCandidateId) {
    await knex.transaction(async (trx) => {
      await trx('complementary-certification-subscriptions').where({ certificationCandidateId }).del();
      return trx('certification-candidates').where({ id: certificationCandidateId }).del();
    });

    return true;
  },

  async isNotLinked(certificationCandidateId) {
    const notLinkedCandidate = await CertificationCandidateBookshelf.where({
      id: certificationCandidateId,
      userId: null,
    }).fetch({ require: false, columns: ['id'] });

    return !!notLinkedCandidate;
  },

  async getBySessionIdAndUserId({ sessionId, userId }) {
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
  },

  async findBySessionId(sessionId) {
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
  },

  async findBySessionIdAndPersonalInfo({ sessionId, firstName, lastName, birthdate }) {
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
  },

  findOneBySessionIdAndUserId({ sessionId, userId }) {
    return CertificationCandidateBookshelf.where({ sessionId, userId })
      .fetchAll()
      .then((results) => _buildCertificationCandidates(results)[0]);
  },

  async doesLinkedCertificationCandidateInSessionExist({ sessionId }) {
    const anyLinkedCandidateInSession = await CertificationCandidateBookshelf.query({
      where: { sessionId },
      whereNotNull: 'userId',
    }).fetch({ require: false, columns: 'id' });

    return anyLinkedCandidateInSession !== null;
  },

  async update(certificationCandidate) {
    const result = await knex('certification-candidates')
      .where({ id: certificationCandidate.id })
      .update({ authorizedToStart: certificationCandidate.authorizedToStart });

    if (result === 0) {
      throw new NotFoundError('Aucun candidat trouvé');
    }
  },

  async deleteBySessionId({ sessionId }) {
    await knex('complementary-certification-subscriptions')
      .whereIn('certificationCandidateId', knex.select('id').from('certification-candidates').where({ sessionId }))
      .del();

    await knex('certification-candidates').where({ sessionId }).del();
  },

  async getWithComplementaryCertifications(id) {
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
  },
};

function _buildCertificationCandidates(results) {
  if (results?.models[0]) {
    results.models.forEach((model, index) => {
      results.models[index].attributes.schoolingRegistrationId = model.attributes.organizationLearnerId;
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
    organizationLearnerId: certificationCandidateToSave.schoolingRegistrationId,
    sex: certificationCandidateToSave.sex,
  };
}

function _toDomain(candidateData) {
  const complementaryCertifications = candidateData.complementaryCertifications
    .filter((certificationData) => certificationData !== null)
    .map((certification) => new ComplementaryCertification(certification));

  return new CertificationCandidate({
    ...candidateData,
    schoolingRegistrationId: candidateData.organizationLearnerId,
    complementaryCertifications,
  });
}
