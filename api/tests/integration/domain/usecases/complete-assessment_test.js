import { CertificationCompletedJob } from '../../../../lib/domain/events/CertificationCompleted.js';
import { completeAssessment } from '../../../../lib/domain/usecases/complete-assessment.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { certificationCompletedJobRepository } from '../../../../lib/infrastructure/repositories/jobs/certification-completed-job-repository.js';
import { CampaignParticipationCompletedJob } from '../../../../src/prescription/campaign-participation/domain/models/CampaignParticipationCompletedJob.js';
import * as campaignParticipationBCRepository from '../../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { campaignParticipationCompletedJobRepository } from '../../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/campaign-participation-completed-job-repository.js';
import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import * as assessmentRepository from '../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';
import { jobs } from '../../../tooling/jobs/expect-job.js';

const { TO_SHARE, STARTED } = CampaignParticipationStatuses;

describe('Integration | Usecase | Complete Assessment', function () {
  let userId, assessmentId, campaignParticipationId;

  describe('#completeAssessment', function () {
    context('when assessment is linked to a campaign participation', function () {
      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser().id;
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

        const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          status: STARTED,
        }).id;

        assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          campaignParticipationId,
          state: Assessment.states.STARTED,
        }).id;

        return databaseBuilder.commit();
      });

      it('should update campaign participation status from `STARTED` to `TO_SHARE` in one and only transaction', async function () {
        await DomainTransaction.execute(async (domainTransaction) => {
          // when
          await completeAssessment({
            assessmentId,
            campaignParticipationBCRepository,
            assessmentRepository,
            certificationCompletedJobRepository,
            campaignParticipationCompletedJobRepository,
          });

          // then
          const transactionAssessment = await domainTransaction
            .knexTransaction('campaign-participations')
            .select('id', 'status')
            .where({ id: campaignParticipationId })
            .first();
          expect(transactionAssessment).to.deep.equal({ id: campaignParticipationId, status: TO_SHARE });

          const realAssessment = await knex('campaign-participations')
            .select('id', 'status')
            .where({ id: campaignParticipationId })
            .first();
          expect(realAssessment).to.deep.equal({ id: campaignParticipationId, status: STARTED });
        });

        const results = await jobs(CampaignParticipationCompletedJob.name);
        expect(results).to.have.lengthOf(1);
      });
    });

    context('when assessment is linked to a certification course', function () {
      let sessionId;
      beforeEach(async function () {
        databaseBuilder.factory.buildSession({}).id;
        userId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildCertificationCandidate({
          sessionId,
          userId,
        }).id;

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          userId,
        }).id;

        assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
          certificationCourseId: certificationCourse.id,
          state: Assessment.states.STARTED,
          type: 'CERTIFICATION',
        }).id;

        return databaseBuilder.commit();
      });

      it('completes assessment and creates a CertificationCompletedJob', async function () {
        // when
        await completeAssessment({
          assessmentId,
          campaignParticipationBCRepository,
          assessmentRepository,
          certificationCompletedJobRepository,
          campaignParticipationCompletedJobRepository,
        });

        // then
        const assessmentInDb = await knex('assessments')
          .where('id', assessmentId)
          .first('state', 'updatedAt', 'createdAt');
        expect(assessmentInDb.state).to.equal(Assessment.states.COMPLETED);

        const results = await jobs(CertificationCompletedJob.name);
        expect(results).to.have.lengthOf(1);
      });
    });
  });
});
