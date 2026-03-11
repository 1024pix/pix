import { usecases } from '../../../../../../src/certification/evaluation/domain/usecases/index.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { catchErr, databaseBuilder, expect, knex, sinon } from '../../../../../test-helper.js';

const { completeCertificationAssessment } = usecases;

describe('Certification | Evaluation | Integration | Domain | UseCase | complete-certification-assessment', function () {
  const locale = 'someLocale';
  let certificationCourseId, assessmentId, args, clock;
  const now = new Date();

  beforeEach(async function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
      abortReason: 'candidate',
      maxReachableLevelOnCertificationDate: 6,
      isRejectedForFraud: true,
    }).id;
    await databaseBuilder.commit();

    args = {
      certificationCourseId,
      locale,
    };
  });

  afterEach(async function () {
    clock.restore();
  });

  context('when certification does not exist', function () {
    it('should throw a NotFound error', async function () {
      const err = await catchErr(completeCertificationAssessment)({
        ...args,
        certificationCourseId: certificationCourseId + 1,
      });

      expect(err).to.deepEqualInstance(new NotFoundError('Assessment not found'));
    });
  });

  context(`when assessment is ${Assessment.states.STARTED}`, function () {
    it('should complete the certification test and add job to the queue', async function () {
      // given
      assessmentId = databaseBuilder.factory.buildAssessment({
        certificationCourseId,
        state: Assessment.states.STARTED,
        updatedAt: new Date('2023-10-05'),
      }).id;
      await databaseBuilder.commit();

      // when
      await completeCertificationAssessment(args);

      // then
      const assessmentStateAndUpdatedAt = await knex('assessments')
        .select('state', 'updatedAt')
        .where({ id: assessmentId })
        .first();
      expect(assessmentStateAndUpdatedAt).to.deep.equal({ state: Assessment.states.COMPLETED, updatedAt: now });
      await expect('CertificationCompletedJob').to.have.been.schedule.withJob({
        data: {
          certificationCourseId,
          locale,
          correlationContext: {
            user_id: '-',
          },
        },
      });
    });
  });

  Object.values(Assessment.states)
    .filter((state) => state !== Assessment.states.STARTED)
    .forEach((state) => {
      it(`should not complete assessment nor launch scoring job when state is ${state}`, async function () {
        assessmentId = databaseBuilder.factory.buildAssessment({
          certificationCourseId,
          state,
          updatedAt: new Date('2023-10-05'),
        }).id;
        await databaseBuilder.commit();

        // when
        await completeCertificationAssessment(args);

        // then
        const assessmentStateAndUpdatedAt = await knex('assessments')
          .select('state', 'updatedAt')
          .where({ id: assessmentId })
          .first();
        expect(assessmentStateAndUpdatedAt).to.deep.equal({ state, updatedAt: new Date('2023-10-05') });
        await expect('CertificationCompletedJob').to.have.been.schedule.withJobsCount(0);
      });
    });
});
