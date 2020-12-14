const { databaseBuilder, expect, knex, domainBuilder } = require('../../../test-helper');
const scoCertificationCandidateRepository = require('../../../../lib/infrastructure/repositories/sco-certification-candidate-repository');
const _ = require('lodash');

describe('Integration | Repository | SCOCertificationCandidate', function() {

  describe('#addNonEnrolledCandidatesToSession', () => {
    let sessionId;

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('certification-candidates').delete();
    });

    it('adds only the unenrolled candidates', async () => {
      // given
      const schoolingRegistrationId1 = databaseBuilder.factory.buildSchoolingRegistration().id;
      const schoolingRegistrationId2 = databaseBuilder.factory.buildSchoolingRegistration().id;
      const scoCandidateAlreadySaved1 = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        schoolingRegistrationId: schoolingRegistrationId1,
      });
      const scoCandidateAlreadySaved2 = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        schoolingRegistrationId: schoolingRegistrationId2,
      });
      const schoolingRegistrationId3 = databaseBuilder.factory.buildSchoolingRegistration().id;
      const schoolingRegistrationId4 = databaseBuilder.factory.buildSchoolingRegistration().id;
      await databaseBuilder.commit();

      const scoCandidates = [
        domainBuilder.buildSCOCertificationCandidate(scoCandidateAlreadySaved1),
        domainBuilder.buildSCOCertificationCandidate(scoCandidateAlreadySaved2),
        domainBuilder.buildSCOCertificationCandidate({
          id: null,
          schoolingRegistrationId: schoolingRegistrationId3,
          sessionId,
        }),
        domainBuilder.buildSCOCertificationCandidate({
          id: null,
          schoolingRegistrationId: schoolingRegistrationId4,
          sessionId,
        }),
      ];

      // when
      await scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession({
        sessionId,
        scoCertificationCandidates: scoCandidates,
      });

      // then
      const candidates = await knex('certification-candidates').select();
      const actualCandidates = candidatesToBeCompared(candidates);
      const expectedCandidates = candidatesToBeCompared(scoCandidates);
      expect(actualCandidates).to.deep.equal(expectedCandidates);
    });
    it('does nothing when no candidate is given', async () => {
      // when
      await scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession({
        sessionId,
        scoCertificationCandidates: [],
      });

      // then
      const candidates = await knex('certification-candidates').select();
      expect(candidates).to.be.empty;
    });
  });
});

function fieldsToBeCompared(candidate) {
  return _.pick(candidate, ['firstName', 'lastName', 'birthdate', 'schoolingRegistrationId', 'sessionId']);
}

function candidatesToBeCompared(candidates) {
  return _.map(candidates, (candidate) => fieldsToBeCompared(candidate));
}
