import * as scoCertificationCandidateRepository from '../../../../../../src/certification/results/infrastructure/repositories/sco-certification-candidate-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

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
      const candidate = domainBuilder.certification.enrolment
        .candidateBuilder()
        .asReconciled({
          userId,
        })
        .asScoCandidate({
          organizationLearnerId,
        })
        .withParameters({
          sessionId,
        })
        .insertToDB({
          databaseBuilder,
        });
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
      const nonDisabledCandidate = domainBuilder.certification.enrolment
        .candidateBuilder()
        .asReconciled()
        .asScoCandidate({
          organizationLearnerId: nonDisabledOrganizationLearnerId,
        })
        .withParameters({
          sessionId,
        })
        .insertToDB({ databaseBuilder });

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

      const disabledCandidate = domainBuilder.certification.enrolment
        .candidateBuilder()
        .asScoCandidate({
          organizationLearnerId: disabledOrganizationLearnerId,
        })
        .withParameters({
          sessionId,
        })
        .insertToDB({ databaseBuilder });

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
      const candidateFromTheGivenDivision = domainBuilder.certification.enrolment
        .candidateBuilder()
        .asReconciled()
        .asScoCandidate({
          organizationLearnerId: aOrganizationLearnerId,
        })
        .withParameters({
          sessionId,
        })
        .insertToDB({ databaseBuilder });

      databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        lastName: candidateFromTheGivenDivision.lastName,
        firstName: candidateFromTheGivenDivision.firstName,
        isPublished: true,
        userId: candidateFromTheGivenDivision.userId,
        pixCertificationStatus: 'validated',
      });

      const candidateFromAnotherDivision = domainBuilder.certification.enrolment
        .candidateBuilder()
        .asReconciled()
        .asScoCandidate({
          organizationLearnerId: anotherOrganizationLearnerId,
        })
        .withParameters({
          sessionId,
        })
        .insertToDB({ databaseBuilder });
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

      const thirdInAlphabeticOrderCandidate = domainBuilder.certification.enrolment
        .candidateBuilder()
        .asReconciled()
        .withIdentity({
          lastName: 'Zen',
          firstName: 'Bob',
        })
        .asScoCandidate({
          organizationLearnerId: aOrganizationLearnerId,
        })
        .withParameters({
          sessionId,
        })
        .insertToDB({ databaseBuilder });

      const firstInAlphabeticOrderCandidate = domainBuilder.certification.enrolment
        .candidateBuilder()
        .asReconciled()
        .withIdentity({
          firstName: 'Smith',
          lastName: 'Aaron',
        })
        .asScoCandidate({
          organizationLearnerId: yetAnotherOrganizationLearnerId,
        })
        .withParameters({
          sessionId,
        })
        .insertToDB({ databaseBuilder });

      const secondInAlphabeticOrderCandidate = domainBuilder.certification.enrolment
        .candidateBuilder()
        .asReconciled()
        .withIdentity({
          firstName: 'Smith',
          lastName: 'Ben',
        })
        .asScoCandidate({
          organizationLearnerId: anotherOrganizationLearnerId,
        })
        .withParameters({
          sessionId,
        })
        .insertToDB({ databaseBuilder });

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
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organizationId,
        division,
      }).id;
      const sessionIdOne = databaseBuilder.factory.buildSession({ publishedAt: '2024-02-01' }).id;
      const sessionIdTwo = databaseBuilder.factory.buildSession({ publishedAt: '2024-01-01' }).id;
      // This candidate has no related certification-course
      domainBuilder.certification.enrolment
        .candidateBuilder()
        .asReconciled()
        .withIdentity({
          firstName: 'Smith',
          lastName: 'Aaron',
        })
        .asScoCandidate({
          organizationLearnerId,
        })
        .withParameters({
          sessionId: sessionIdOne,
        })
        .insertToDB({ databaseBuilder });

      const candidateThatEnteredTheSession = domainBuilder.certification.enrolment
        .candidateBuilder()
        .asReconciled()
        .withIdentity({
          firstName: 'Smith',
          lastName: 'Aaron',
        })
        .asScoCandidate({
          organizationLearnerId,
        })
        .withParameters({
          sessionId: sessionIdTwo,
        })
        .insertToDB({ databaseBuilder });

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
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationId,
          division,
        }).id;
        const sessionPublishedId = databaseBuilder.factory.buildSession({ publishedAt: '2024-01-01' }).id;
        const unpublishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: null }).id;
        const candidateFromUnpublishedSession = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'Smith',
            lastName: 'Aaron',
          })
          .asScoCandidate({
            organizationLearnerId,
          })
          .withParameters({
            sessionId: unpublishedSessionId,
          })
          .insertToDB({ databaseBuilder });

        const candidateFromPublishedSession = domainBuilder.certification.enrolment
          .candidateBuilder()
          .asReconciled()
          .withIdentity({
            firstName: 'Smith',
            lastName: 'Aaron',
          })
          .asScoCandidate({
            organizationLearnerId,
          })
          .withParameters({
            sessionId: sessionPublishedId,
          })
          .insertToDB({ databaseBuilder });

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
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationId,
          division,
        }).id;
        const firstCertificationCourseStartDate = new Date('2022-01-01T09:00:33Z');
        const secondCertificationCourseStartDate = new Date('2022-01-01T09:23:00Z');

        const sessionIdOne = databaseBuilder.factory.buildSession({ publishedAt: '2024-02-01' }).id;
        const sessionIdTwo = databaseBuilder.factory.buildSession({ publishedAt: '2024-01-01' }).id;

        const candidateLinkedToTheFirstSession = domainBuilder.certification.enrolment
          .candidateBuilder()
          .asReconciled()
          .withIdentity({
            firstName: 'Smith',
            lastName: 'Aaron',
          })
          .asScoCandidate({
            organizationLearnerId,
          })
          .withParameters({
            sessionId: sessionIdOne,
          })
          .insertToDB({ databaseBuilder });

        databaseBuilder.factory.buildCertificationCourse({
          createdAt: firstCertificationCourseStartDate,
          sessionId: candidateLinkedToTheFirstSession.sessionId,
          lastName: candidateLinkedToTheFirstSession.lastName,
          firstName: candidateLinkedToTheFirstSession.firstName,
          isPublished: true,
          userId: candidateLinkedToTheFirstSession.userId,
          pixCertificationStatus: 'rejected',
        });

        const candidateLinkedToTheSecondSession = domainBuilder.certification.enrolment
          .candidateBuilder()
          .asReconciled()
          .withIdentity({
            firstName: 'Smith',
            lastName: 'Aaron',
          })
          .asScoCandidate({
            organizationLearnerId,
          })
          .withParameters({
            sessionId: sessionIdTwo,
          })
          .insertToDB({ databaseBuilder });

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
