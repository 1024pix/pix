import * as certificationCandidateRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/certification-candidate-repository.js';
import { CertificationCandidateNotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | certification candidate', function () {
  describe('#findByAssessmentId', function () {
    describe('when certification candidate is found', function () {
      it('should return the certification candidate', async function () {
        // given
        const session = databaseBuilder.factory.buildSession();
        const user = databaseBuilder.factory.buildUser();
        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Joplin',
          firstName: 'Janis',
          sessionId: session.id,
          userId: user.id,
          authorizedToStart: false,
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
          }),
        );
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
          databaseBuilder.factory.buildCertificationCandidate({
            lastName: 'Joplin',
            firstName: 'Janis',
            sessionId: otherSession.id,
            userId: user.id,
            authorizedToStart: false,
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
            authorizedToStart: false,
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
            }),
          );
        });
      });
    });
  });
});
