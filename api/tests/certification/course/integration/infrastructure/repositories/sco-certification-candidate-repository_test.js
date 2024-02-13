import { databaseBuilder, expect } from '../../../../../test-helper.js';
import * as scoCertificationCandidateRepository from '../../../../../../src/certification/course/infrastructure/repositories/sco-certification-candidate-repository.js';

describe('Certification | Course | Integration | Repository | SCOCertificationCandidate', function () {
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

    it('retrieves last candidates ordered by lastname and firstname', async function () {
      // given
      const sessionInThePastId = databaseBuilder.factory.buildSession({ publishedAt: '2020-01-01' }).id;
      const sessionId = databaseBuilder.factory.buildSession({ publishedAt: '2024-01-01' }).id;
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

      databaseBuilder.factory.buildCertificationCandidate({
        firstName: 'Smith',
        lastName: 'Aaron',
        sessionId: sessionInThePastId,
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

    it('should not retrieve unpublished sessions', async function () {
      // given
      const division = '3ème A';
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const candidate = {
        firstName: 'Smith',
        lastName: 'Aaron',
        organizationLearnerId: databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationId,
          division,
        }).id,
      };
      const sessionPublishedId = databaseBuilder.factory.buildSession({ publishedAt: '2024-01-01' }).id;
      const unpublishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: null }).id;
      databaseBuilder.factory.buildCertificationCandidate({
        ...candidate,
        sessionId: unpublishedSessionId,
      }).id;
      const candidateIdFromPublishedSession = databaseBuilder.factory.buildCertificationCandidate({
        ...candidate,
        sessionId: sessionPublishedId,
      }).id;

      await databaseBuilder.commit();

      // when
      const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
        organizationId,
        division,
      });

      // then
      expect(candidatesIds).to.deep.equal([candidateIdFromPublishedSession]);
    });
  });
});
