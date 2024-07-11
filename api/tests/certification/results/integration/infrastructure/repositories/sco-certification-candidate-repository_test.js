import * as scoCertificationCandidateRepository from '../../../../../../src/certification/results/infrastructure/repositories/sco-certification-candidate-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Course | Integration | Repository | SCOCertificationCandidate', function () {
  describe('#findIdsByOrganizationIdAndDivision', function () {
    it('retrieves no candidates when no one belongs to organization', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2024-01-01') }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      const anOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      const candidate = databaseBuilder.factory.buildCertificationCandidate({
        userId,
        sessionId,
        organizationLearnerId,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        lastName: candidate.lastName,
        firstName: candidate.firstName,
        isPublished: true,
        userId: candidate.userId,
        pixCertificationStatus: 'validated',
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
      const sessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2024-01-01') }).id;
      const anOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const nonDisabledOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème A',
        isDisabled: false,
      }).id;
      const nonDisabledCandidate = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: nonDisabledOrganizationLearnerId,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: nonDisabledCandidate.id });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        lastName: nonDisabledCandidate.lastName,
        firstName: nonDisabledCandidate.firstName,
        isPublished: true,
        userId: nonDisabledCandidate.userId,
        pixCertificationStatus: 'validated',
      });

      const disabledOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème A',
        isDisabled: true,
      }).id;
      const disabledCandidate = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: disabledOrganizationLearnerId,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: disabledCandidate.id });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        lastName: disabledCandidate.lastName,
        firstName: disabledCandidate.firstName,
        isPublished: true,
        userId: disabledCandidate.userId,
        pixCertificationStatus: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
        organizationId: anOrganizationId,
        division: '3ème A',
      });

      // then
      expect(candidatesIds).to.deep.equal([nonDisabledCandidate.id]);
    });

    it('retrieves only the candidates that belongs to the given division', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2024-01-01') }).id;
      const anOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const aOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème A',
      }).id;
      const anotherOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: anOrganizationId,
        division: '3ème B',
      }).id;
      const candidateFromTheGivenDivision = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: aOrganizationLearnerId,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateFromTheGivenDivision.id });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        lastName: candidateFromTheGivenDivision.lastName,
        firstName: candidateFromTheGivenDivision.firstName,
        isPublished: true,
        userId: candidateFromTheGivenDivision.userId,
        pixCertificationStatus: 'validated',
      });

      const candidateFromAnotherDivision = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        organizationLearnerId: anotherOrganizationLearnerId,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateFromAnotherDivision.id });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        lastName: candidateFromAnotherDivision.lastName,
        firstName: candidateFromAnotherDivision.firstName,
        isPublished: true,
        userId: candidateFromAnotherDivision.userId,
        pixCertificationStatus: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
        organizationId: anOrganizationId,
        division: '3ème A',
      });

      // then
      expect(candidatesIds).to.deep.equal([candidateFromTheGivenDivision.id]);
    });

    it('retrieves candidates ordered by lastname and firstname', async function () {
      // given
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

      const thirdInAlphabeticOrderCandidate = databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Zen',
        firstName: 'Bob',
        sessionId,
        organizationLearnerId: aOrganizationLearnerId,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: thirdInAlphabeticOrderCandidate.id });

      const firstInAlphabeticOrderCandidate = databaseBuilder.factory.buildCertificationCandidate({
        firstName: 'Smith',
        lastName: 'Aaron',
        sessionId,
        organizationLearnerId: yetAnotherOrganizationLearnerId,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: firstInAlphabeticOrderCandidate.id });

      const secondInAlphabeticOrderCandidate = databaseBuilder.factory.buildCertificationCandidate({
        firstName: 'Smith',
        lastName: 'Ben',
        sessionId,
        organizationLearnerId: anotherOrganizationLearnerId,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: secondInAlphabeticOrderCandidate.id });

      databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        lastName: thirdInAlphabeticOrderCandidate.lastName,
        firstName: thirdInAlphabeticOrderCandidate.firstName,
        isPublished: true,
        userId: thirdInAlphabeticOrderCandidate.userId,
        pixCertificationStatus: 'validated',
      });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        lastName: firstInAlphabeticOrderCandidate.lastName,
        firstName: firstInAlphabeticOrderCandidate.firstName,
        isPublished: true,
        userId: firstInAlphabeticOrderCandidate.userId,
        pixCertificationStatus: 'validated',
      });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        lastName: secondInAlphabeticOrderCandidate.lastName,
        firstName: secondInAlphabeticOrderCandidate.firstName,
        isPublished: true,
        userId: secondInAlphabeticOrderCandidate.userId,
        pixCertificationStatus: 'validated',
      });

      await databaseBuilder.commit();

      // when
      const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
        organizationId: anOrganizationId,
        division: '3ème A',
      });

      // then
      expect(candidatesIds).to.deep.equal([
        firstInAlphabeticOrderCandidate.id,
        secondInAlphabeticOrderCandidate.id,
        thirdInAlphabeticOrderCandidate.id,
      ]);
    });

    it('should not retrieve candidates who did not enter the session', async function () {
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
      const sessionIdOne = databaseBuilder.factory.buildSession({ publishedAt: '2024-02-01' }).id;
      const sessionIdTwo = databaseBuilder.factory.buildSession({ publishedAt: '2024-01-01' }).id;
      // This candidate has no related certification-course
      databaseBuilder.factory.buildCertificationCandidate({
        ...candidate,
        sessionId: sessionIdOne,
      });
      const candidateThatEnteredTheSession = databaseBuilder.factory.buildCertificationCandidate({
        ...candidate,
        sessionId: sessionIdTwo,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateThatEnteredTheSession.id });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId: candidateThatEnteredTheSession.sessionId,
        lastName: candidateThatEnteredTheSession.lastName,
        firstName: candidateThatEnteredTheSession.firstName,
        isPublished: true,
        userId: candidateThatEnteredTheSession.userId,
        pixCertificationStatus: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
        organizationId,
        division,
      });

      // then
      expect(candidatesIds).to.deep.equal([candidateThatEnteredTheSession.id]);
    });

    context('when one candidate entered multiple sessions', function () {
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
        const candidateFromUnpublishedSession = databaseBuilder.factory.buildCertificationCandidate({
          ...candidate,
          sessionId: unpublishedSessionId,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateFromUnpublishedSession.id });
        const candidateFromPublishedSession = databaseBuilder.factory.buildCertificationCandidate({
          ...candidate,
          sessionId: sessionPublishedId,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateFromPublishedSession.id });
        databaseBuilder.factory.buildCertificationCourse({
          sessionId: unpublishedSessionId,
          lastName: candidateFromUnpublishedSession.lastName,
          firstName: candidateFromUnpublishedSession.firstName,
          isPublished: false,
          userId: candidateFromUnpublishedSession.userId,
        });
        databaseBuilder.factory.buildCertificationCourse({
          sessionId: sessionPublishedId,
          lastName: candidateFromPublishedSession.lastName,
          firstName: candidateFromPublishedSession.firstName,
          isPublished: true,
          userId: candidateFromPublishedSession.userId,
        });

        await databaseBuilder.commit();

        // when
        const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
          organizationId,
          division,
        });

        // then
        expect(candidatesIds).to.deep.equal([candidateFromPublishedSession.id]);
      });

      it('should retrieve the latest candidate', async function () {
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
        const firstCertificationCourseStartDate = new Date('2022-01-01T09:00:33Z');
        const secondCertificationCourseStartDate = new Date('2022-01-01T09:23:00Z');

        const sessionIdOne = databaseBuilder.factory.buildSession({ publishedAt: '2024-02-01' }).id;
        const sessionIdTwo = databaseBuilder.factory.buildSession({ publishedAt: '2024-01-01' }).id;

        const candidateLinkedToTheFirstSession = databaseBuilder.factory.buildCertificationCandidate({
          ...candidate,
          sessionId: sessionIdOne,
        });
        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId: candidateLinkedToTheFirstSession.id,
        });
        databaseBuilder.factory.buildCertificationCourse({
          createdAt: firstCertificationCourseStartDate,
          sessionId: candidateLinkedToTheFirstSession.sessionId,
          lastName: candidateLinkedToTheFirstSession.lastName,
          firstName: candidateLinkedToTheFirstSession.firstName,
          isPublished: true,
          userId: candidateLinkedToTheFirstSession.userId,
          pixCertificationStatus: 'rejected',
        });

        const candidateLinkedToTheSecondSession = databaseBuilder.factory.buildCertificationCandidate({
          ...candidate,
          sessionId: sessionIdTwo,
        });
        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId: candidateLinkedToTheSecondSession.id,
        });
        databaseBuilder.factory.buildCertificationCourse({
          createdAt: secondCertificationCourseStartDate,
          sessionId: candidateLinkedToTheSecondSession.sessionId,
          lastName: candidateLinkedToTheSecondSession.lastName,
          firstName: candidateLinkedToTheSecondSession.firstName,
          isPublished: true,
          userId: candidateLinkedToTheSecondSession.userId,
          pixCertificationStatus: 'validated',
        });
        await databaseBuilder.commit();

        // when
        const candidatesIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
          organizationId,
          division,
        });

        // then
        expect(candidatesIds).to.deep.equal([candidateLinkedToTheSecondSession.id]);
      });
    });
  });
});
