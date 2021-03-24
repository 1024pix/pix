const { databaseBuilder, expect, knex, domainBuilder } = require('../../../test-helper');
const scoCertificationCandidateRepository = require('../../../../lib/infrastructure/repositories/sco-certification-candidate-repository');
const _ = require('lodash');

describe('Integration | Repository | SCOCertificationCandidate', function() {

  describe('#addNonEnrolledCandidatesToSession', function() {
    let sessionId;

    beforeEach(function() {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    afterEach(function() {
      return knex('certification-candidates').delete();
    });

    it('adds only the unenrolled candidates', async function() {
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
    it('does nothing when no candidate is given', async function() {
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

  describe('#findIdsByOrganizationIdAndDivision', async function() {
    it('retrieves no candidates when no one belongs to organisation', async function() {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const anOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        schoolingRegistrationId,
      });
      await databaseBuilder.commit();

      // when
      const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
        organizationId: anotherOrganizationId,
        division: '3ème A',
      });

      // then
      expect(candidatesIds).to.be.empty;
    });

    it('retrieves the candidates that belong to the organisation and division', async function() {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const anOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        schoolingRegistrationId,
      }).id;
      await databaseBuilder.commit();

      // when
      const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
        organizationId: anOrganizationId,
        division: '3ème A',
      });

      // then
      expect(candidatesIds).to.deep.equal([candidateId]);
    });

    it('retrieves only the candidates that belongs to the given division', async function() {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const anOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const aSchoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      const anotherSchoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: anOrganizationId,
        division: '3ème B',
      }).id;
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        schoolingRegistrationId: aSchoolingRegistrationId,
      }).id;
      databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        schoolingRegistrationId: anotherSchoolingRegistrationId,
      }).id;
      await databaseBuilder.commit();

      // when
      const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
        organizationId: anOrganizationId,
        division: '3ème A',
      });

      // then
      expect(candidatesIds).to.deep.equal([candidateId]);
    });

    it('retrieves candidates ordered by lastname and firstname', async function() {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const anOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const aSchoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      const anotherSchoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      const yetAnotherSchoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      const thirdInAlphabeticOrderCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Zen',
        firstName: 'Bob',
        sessionId,
        schoolingRegistrationId: aSchoolingRegistrationId,
      }).id;
      const firstInAlphabeticOrderCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        firstName: 'Smith',
        lastName: 'Aaron',
        sessionId,
        schoolingRegistrationId: yetAnotherSchoolingRegistrationId,
      }).id;
      const secondInAlphabeticOrderCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        firstName: 'Smith',
        lastName: 'Ben',
        sessionId,
        schoolingRegistrationId: anotherSchoolingRegistrationId,
      }).id;

      await databaseBuilder.commit();

      // when
      const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
        organizationId: anOrganizationId,
        division: '3ème A',
      });

      // then
      expect(candidatesIds).to.deep.equal([
        firstInAlphabeticOrderCandidateId,
        secondInAlphabeticOrderCandidateId,
        thirdInAlphabeticOrderCandidateId,
      ]);
    });
  });
});

function fieldsToBeCompared(candidate) {
  return _.pick(candidate, ['firstName', 'lastName', 'birthdate', 'schoolingRegistrationId', 'sessionId']);
}

function candidatesToBeCompared(candidates) {
  return _.map(candidates, (candidate) => fieldsToBeCompared(candidate));
}
