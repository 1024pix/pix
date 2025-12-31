import * as certificationCandidateRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/certification-candidate-repository.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { CertificationCandidateNotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | certification candidate', function () {
  describe('#findByAssessmentId', function () {
    describe('when certification candidate is found', function () {
      context('when certification candidate has only subscribed to Pix Core', function () {
        it('should return a candidate with a CORE subscription scope', async function () {
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
          });
          const assessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId: certificationCourse.id,
            state: Assessment.states.STARTED,
          }).id;

          await databaseBuilder.commit();

          // when
          const result = await certificationCandidateRepository.findByAssessmentId({
            assessmentId,
          });

          // then
          expect(result).to.deep.equal(
            domainBuilder.certification.evaluation.buildCandidate({
              ...candidate,
              subscriptionScope: SCOPES.CORE,
            }),
          );
        });
      });

      context('when certification candidate has only a complementary subscription', function () {
        it('should return a candidate with a complementary certification subscription scope', async function () {
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
          });
          const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
            key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
          });
          databaseBuilder.factory.buildComplementaryCertificationSubscription({
            certificationCandidateId: candidate.id,
            complementaryCertificationId: complementaryCertification.id,
          });
          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            userId: user.id,
            sessionId: session.id,
            createdAt: new Date('2022-10-01T14:00:00Z'),
          });
          databaseBuilder.factory.buildComplementaryCertificationCourse({
            certificationCourseId: certificationCourse.id,
            complementaryCertificationId: complementaryCertification.id,
            complementaryCertificationKey: complementaryCertification.key,
          });
          const assessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId: certificationCourse.id,
            state: Assessment.states.STARTED,
          }).id;

          await databaseBuilder.commit();

          // when
          const result = await certificationCandidateRepository.findByAssessmentId({
            assessmentId,
          });

          // then
          expect(result).to.deep.equal(
            domainBuilder.certification.evaluation.buildCandidate({
              ...candidate,
              subscriptionScope: SCOPES.PIX_PLUS_DROIT,
            }),
          );
        });
      });

      context('when certification candidate has a double certification subscription', function () {
        it('should return a candidate with a CORE subscription scope', async function () {
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
          });

          const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
            key: ComplementaryCertificationKeys.CLEA,
          });
          databaseBuilder.factory.buildComplementaryCertificationSubscription({
            certificationCandidateId: candidate.id,
            complementaryCertificationId: complementaryCertification.id,
          });
          databaseBuilder.factory.buildCoreSubscription({
            certificationCandidateId: candidate.id,
          });
          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            userId: user.id,
            sessionId: session.id,
            createdAt: new Date('2022-10-01T14:00:00Z'),
          });
          databaseBuilder.factory.buildComplementaryCertificationCourse({
            certificationCourseId: certificationCourse.id,
            complementaryCertificationId: complementaryCertification.id,
            complementaryCertificationKey: complementaryCertification.key,
          });
          const assessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId: certificationCourse.id,
            state: Assessment.states.STARTED,
          }).id;

          await databaseBuilder.commit();

          // when
          const result = await certificationCandidateRepository.findByAssessmentId({
            assessmentId,
          });

          // then
          expect(result).to.deep.equal(
            domainBuilder.certification.evaluation.buildCandidate({
              ...candidate,
              subscriptionScope: SCOPES.CORE,
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
        const error = await catchErr(certificationCandidateRepository.findByAssessmentId)({
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
          });
          const assessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId: certificationCourse.id,
            state: Assessment.states.STARTED,
          }).id;

          await databaseBuilder.commit();

          // when
          const result = await certificationCandidateRepository.findByAssessmentId({
            assessmentId,
          });

          // then
          expect(result).to.deep.equal(
            domainBuilder.certification.evaluation.buildCandidate({
              ...candidate,
              subscriptionScope: SCOPES.CORE,
            }),
          );
        });
      });
    });
  });
});
