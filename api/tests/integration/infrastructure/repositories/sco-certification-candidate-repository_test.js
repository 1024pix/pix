import { databaseBuilder, expect, knex, domainBuilder } from '../../../test-helper.js';
import * as scoCertificationCandidateRepository from '../../../../lib/infrastructure/repositories/sco-certification-candidate-repository.js';
import _ from 'lodash';

describe('Integration | Repository | SCOCertificationCandidate', function () {
  describe('#addNonEnrolledCandidatesToSession', function () {
    let sessionId;

    beforeEach(function () {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    it('adds only the unenrolled candidates', async function () {
      // given
      const organizationLearnerId1 = databaseBuilder.factory.buildOrganizationLearner().id;
      const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner().id;
      const scoCandidateAlreadySaved1 = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: organizationLearnerId1,
      });
      const scoCandidateAlreadySaved2 = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: organizationLearnerId2,
      });
      const organizationLearnerId3 = databaseBuilder.factory.buildOrganizationLearner().id;
      const organizationLearnerId4 = databaseBuilder.factory.buildOrganizationLearner().id;
      await databaseBuilder.commit();

      const scoCandidates = [
        domainBuilder.buildSCOCertificationCandidate({
          ...scoCandidateAlreadySaved1,
          organizationLearnerId: scoCandidateAlreadySaved1.organizationLearnerId,
        }),
        domainBuilder.buildSCOCertificationCandidate({
          ...scoCandidateAlreadySaved2,
          organizationLearnerId: scoCandidateAlreadySaved2.organizationLearnerId,
        }),
        domainBuilder.buildSCOCertificationCandidate({
          id: null,
          firstName: 'Bobby',
          lastName: 'LaPointe',
          birthdate: '2001-01-04',
          sex: 'M',
          birthINSEECode: '75005',
          organizationLearnerId: organizationLearnerId3,
          sessionId,
        }),
        domainBuilder.buildSCOCertificationCandidate({
          id: null,
          organizationLearnerId: organizationLearnerId4,
          sessionId,
        }),
      ];

      // when
      await scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession({
        sessionId,
        scoCertificationCandidates: scoCandidates,
      });

      // then
      const candidates = await knex('certification-candidates').select([
        'firstName',
        'lastName',
        'birthdate',
        'sex',
        'birthINSEECode',
        'organizationLearnerId',
        'sessionId',
      ]);
      const actualCandidates = candidatesToBeCompared(candidates);
      const expectedCandidates = candidatesToBeCompared(scoCandidates);
      expect(actualCandidates).to.exactlyContain(expectedCandidates);
    });

    it('does nothing when no candidate is given', async function () {
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

  describe('#findIdsByOrganizationIdAndDivision', function () {
    it('retrieves no candidates when no one belongs to organization', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const anOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId,
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

    it('retrieves the non disabled candidates that belong to the organization and division', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const anOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const nonDisabledOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème A',
        isDisabled: false,
      }).id;
      const nonDisabledCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: nonDisabledOrganizationLearnerId,
      }).id;

      const disabledOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème A',
        isDisabled: true,
      }).id;
      databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: disabledOrganizationLearnerId,
      });
      await databaseBuilder.commit();

      // when
      const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
        organizationId: anOrganizationId,
        division: '3ème A',
      });

      // then
      expect(candidatesIds).to.deep.equal([nonDisabledCandidateId]);
    });

    it('retrieves only the candidates that belongs to the given division', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const anOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const aOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      const anotherOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème B',
      }).id;
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: aOrganizationLearnerId,
      }).id;
      databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: anotherOrganizationLearnerId,
      });
      await databaseBuilder.commit();

      // when
      const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
        organizationId: anOrganizationId,
        division: '3ème A',
      });

      // then
      expect(candidatesIds).to.deep.equal([candidateId]);
    });

    it('retrieves candidates ordered by lastname and firstname', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const anOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const aOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      const anotherOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      const yetAnotherOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      const thirdInAlphabeticOrderCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Zen',
        firstName: 'Bob',
        sessionId,
        organizationLearnerId: aOrganizationLearnerId,
      }).id;
      const firstInAlphabeticOrderCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        firstName: 'Smith',
        lastName: 'Aaron',
        sessionId,
        organizationLearnerId: yetAnotherOrganizationLearnerId,
      }).id;
      const secondInAlphabeticOrderCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        firstName: 'Smith',
        lastName: 'Ben',
        sessionId,
        organizationLearnerId: anotherOrganizationLearnerId,
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
  return _.pick(candidate, [
    'firstName',
    'lastName',
    'birthdate',
    'sex',
    'birthINSEECode',
    'organizationLearnerId',
    'sessionId',
  ]);
}

function candidatesToBeCompared(candidates) {
  return _.map(candidates, (candidate) => fieldsToBeCompared(candidate));
}
