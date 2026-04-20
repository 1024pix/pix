import * as candidateRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/certification-candidate-repository.js';
import { CertificationCandidateNotFoundError } from '../../../../../../src/certification/shared/domain/errors.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Evaluation | Integration | Repository | certification candidate', function () {
  describe('#findByAssessmentId', function () {
    describe('when certification candidate is found', function () {
      context('when certification candidate has subscribed to Pix Core', function () {
        it('should return a candidate with a CORE subscription framework', async function () {
          // given
          const session = databaseBuilder.factory.buildSession();
          const user = databaseBuilder.factory.buildUser();
          const candidate = databaseBuilder.factory.buildCertificationCandidate({
            lastName: 'Joplin',
            firstName: 'Janis',
            sessionId: session.id,
            userId: user.id,
            reconciledAt: new Date('2024-10-17'),
            authorizedToStart: false,
          });
          databaseBuilder.factory.buildCoreSubscription({
            certificationCandidateId: candidate.id,
          });
          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            userId: user.id,
            sessionId: session.id,
            createdAt: new Date('2022-10-01T14:00:00Z'),
            candidateId: candidate.id,
          });
          const assessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId: certificationCourse.id,
            state: Assessment.states.STARTED,
          }).id;

          await databaseBuilder.commit();

          // when
          const result = await candidateRepository.findByAssessmentId({
            assessmentId,
          });

          // then
          expect(result).to.deep.equal(
            domainBuilder.certification.evaluation.buildCandidate({
              ...candidate,
              subscriptionFramework: Frameworks.CORE,
            }),
          );
        });
      });

      context('when certification candidate has a CLEA subscription', function () {
        it('should return a candidate with a CLEA subscription framework', async function () {
          // given
          const session = databaseBuilder.factory.buildSession();
          const user = databaseBuilder.factory.buildUser();
          const candidate = databaseBuilder.factory.buildCertificationCandidate({
            lastName: 'Hendrix',
            firstName: 'Jimi',
            sessionId: session.id,
            userId: user.id,
            reconciledAt: new Date('2024-10-17'),
            authorizedToStart: false,
            subscription: Frameworks.CLEA,
          });
          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            userId: user.id,
            sessionId: session.id,
            createdAt: new Date('2022-10-01T14:00:00Z'),
            candidateId: candidate.id,
          });
          const assessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId: certificationCourse.id,
            state: Assessment.states.STARTED,
          }).id;

          await databaseBuilder.commit();

          // when
          const result = await candidateRepository.findByAssessmentId({
            assessmentId,
          });

          // then
          expect(result).to.deep.equal(
            domainBuilder.certification.evaluation.buildCandidate({
              ...candidate,
              subscriptionFramework: Frameworks.CLEA,
            }),
          );
        });
      });

      context('when certification candidate has a Pix+ subscription', function () {
        it('should return a candidate with the corresponding subscription framework', async function () {
          // given
          const session = databaseBuilder.factory.buildSession();
          const user = databaseBuilder.factory.buildUser();
          const candidate = databaseBuilder.factory.buildCertificationCandidate({
            lastName: 'Hendrix',
            firstName: 'Jimi',
            sessionId: session.id,
            userId: user.id,
            reconciledAt: new Date('2024-10-17'),
            authorizedToStart: false,
            subscription: Frameworks.DROIT,
          });
          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            userId: user.id,
            sessionId: session.id,
            createdAt: new Date('2022-10-01T14:00:00Z'),
            candidateId: candidate.id,
          });
          const assessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId: certificationCourse.id,
            state: Assessment.states.STARTED,
          }).id;

          await databaseBuilder.commit();

          // when
          const result = await candidateRepository.findByAssessmentId({
            assessmentId,
          });

          // then
          expect(result).to.deep.equal(
            domainBuilder.certification.evaluation.buildCandidate({
              ...candidate,
              subscriptionFramework: Frameworks.DROIT,
            }),
          );
        });
      });
    });

    describe('when certification candidate is not found', function () {
      it('should throw a certification candidate not found error', async function () {
        // given
        const session = databaseBuilder.factory.buildSession();
        const user = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Joplin',
          firstName: 'Janis',
          sessionId: session.id,
          userId: user.id,
          reconciledAt: new Date('2024-10-10'),
          authorizedToStart: false,
        });
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          userId: user.id,
          sessionId: session.id,
          createdAt: new Date('2022-10-01T14:00:00Z'),
        });
        databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourse.id,
          state: Assessment.states.STARTED,
        });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(candidateRepository.findByAssessmentId)({
          assessmentId: 4659,
        });

        // then
        expect(error).to.be.an.instanceOf(CertificationCandidateNotFoundError);
      });
    });

    describe('when candidate has passed several certification sessions while being reconciled with the same user account', function () {
      describe('when certification candidate is found', function () {
        it('should return the certification candidate', async function () {
          // given
          const user = databaseBuilder.factory.buildUser();
          const otherSession = databaseBuilder.factory.buildSession();
          const otherCandidate = databaseBuilder.factory.buildCertificationCandidate({
            lastName: 'Joplin',
            firstName: 'Janis',
            sessionId: otherSession.id,
            userId: user.id,
            reconciledAt: new Date('2024-10-01'),
            authorizedToStart: false,
          });
          databaseBuilder.factory.buildCoreSubscription({
            certificationCandidateId: otherCandidate.id,
          });
          databaseBuilder.factory.buildCertificationCourse({
            userId: user.id,
            sessionId: otherSession.id,
            createdAt: new Date('2022-10-01T14:00:00Z'),
          });

          const session = databaseBuilder.factory.buildSession();
          const candidate = databaseBuilder.factory.buildCertificationCandidate({
            lastName: 'Joplin',
            firstName: 'Janis',
            sessionId: session.id,
            userId: user.id,
            reconciledAt: new Date('2024-10-18'),
            authorizedToStart: false,
          });
          databaseBuilder.factory.buildCoreSubscription({
            certificationCandidateId: candidate.id,
          });
          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            userId: user.id,
            sessionId: session.id,
            createdAt: new Date('2022-10-01T14:00:00Z'),
            candidateId: candidate.id,
          });
          const assessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId: certificationCourse.id,
            state: Assessment.states.STARTED,
          }).id;

          await databaseBuilder.commit();

          // when
          const result = await candidateRepository.findByAssessmentId({
            assessmentId,
          });

          // then
          expect(result).to.deep.equal(
            domainBuilder.certification.evaluation.buildCandidate({
              ...candidate,
              subscriptionFramework: Frameworks.CORE,
            }),
          );
        });
      });
    });
  });

  describe('#findByUserIdAndSessionId', function () {
    context('when certification candidate is found', function () {
      it('returns the candidate', async function () {
        // given
        const session = databaseBuilder.factory.buildSession();
        const user = databaseBuilder.factory.buildUser();
        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: user.id,
          reconciledAt: new Date('2024-10-17'),
          authorizedToStart: false,
          subscription: Frameworks.DROIT,
        });

        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.findByUserIdAndSessionId({
          sessionId: session.id,
          userId: user.id,
        });

        // then
        expect(result).to.deep.equal(
          domainBuilder.certification.evaluation.buildCandidate({
            ...candidate,
            subscriptionFramework: Frameworks.DROIT,
          }),
        );
      });
    });

    context('when certification candidate is not found', function () {
      it('should throw a certification candidate not found error', async function () {
        // given
        const session = databaseBuilder.factory.buildSession();
        const user = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: user.id,
          reconciledAt: new Date('2024-10-17'),
          authorizedToStart: false,
          subscription: Frameworks.DROIT,
        });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(candidateRepository.findByUserIdAndSessionId)({
          sessionId: session.id + 1,
          userId: user.id,
        });

        // then
        expect(error).to.be.an.instanceOf(CertificationCandidateNotFoundError);
      });
    });
  });

  describe('#update', function () {
    it('updates only authorizedToStart field', async function () {
      // given
      const candidateInDB = databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Joplin',
        firstName: 'Janis',
        reconciledAt: new Date('2024-10-17'),
        authorizedToStart: false,
        subscription: Frameworks.CLEA,
      });
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        candidateId: candidateInDB.id,
      });
      const assessmentId = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse.id,
      }).id;

      await databaseBuilder.commit();
      const candidate = domainBuilder.certification.evaluation.buildCandidate({
        ...candidateInDB,
        reconciledAt: new Date('2021-10-01'),
        subscriptionFramework: Frameworks.EDU_CPE,
        authorizedToStart: true,
      });

      // when
      await candidateRepository.update(candidate);

      // then
      const actualCandidate = await candidateRepository.findByAssessmentId({ assessmentId });
      expect(actualCandidate).to.deep.equal(
        domainBuilder.certification.evaluation.buildCandidate({
          ...candidateInDB,
          subscriptionFramework: candidateInDB.subscription,
          authorizedToStart: true, // only field changed
        }),
      );
    });
  });
});
