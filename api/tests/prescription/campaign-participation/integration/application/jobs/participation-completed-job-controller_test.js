import * as campaignParticipationRepository from '../../../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import * as campaignRepository from '../../../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as poleEmploiSendingRepository from '../../../../../../lib/infrastructure/repositories/pole-emploi-sending-repository.js';
import * as targetProfileRepository from '../../../../../../lib/infrastructure/repositories/target-profile-repository.js';
import * as userRepository from '../../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { ParticipationCompletedJobController } from '../../../../../../src/prescription/campaign-participation/application/jobs/participation-completed-job-controller.js';
import { ParticipationCompletedJob } from '../../../../../../src/prescription/campaign-participation/domain/models/ParticipationCompletedJob.js';
import * as assessmentRepository from '../../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as organizationRepository from '../../../../../../src/shared/infrastructure/repositories/organization-repository.js';
import {
  databaseBuilder,
  expect,
  knex,
  learningContentBuilder,
  mockLearningContent,
  sinon,
} from '../../../../../test-helper.js';

describe('Integration | Prescription | Application | Jobs | ParticipationCompletedJobController', function () {
  let campaignParticipationId, userId, data, poleEmploiNotifier, responseCode;

  describe('#handle', function () {
    beforeEach(async function () {
      responseCode = Symbol('responseCode');
      poleEmploiNotifier = { notify: sinon.stub().resolves({ isSuccessful: true, code: responseCode }) };

      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId });
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const tagId = databaseBuilder.factory.buildTag({ name: 'POLE EMPLOI' }).id;
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId, organizationId }).id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId }).id;
      databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
      data = new ParticipationCompletedJob({ campaignParticipationId });

      const learningContentObjects = learningContentBuilder.fromAreas([]);
      mockLearningContent(learningContentObjects);

      return databaseBuilder.commit();
    });

    it('should notify pole emploi and save success of this notification', async function () {
      // when
      const campaignParticipationCompletedJobController = new ParticipationCompletedJobController();

      await campaignParticipationCompletedJobController.handle({
        data,
        dependencies: {
          assessmentRepository,
          campaignRepository,
          campaignParticipationRepository,
          organizationRepository,
          poleEmploiSendingRepository,
          targetProfileRepository,
          userRepository,
          poleEmploiNotifier,
        },
      });

      // then
      const poleEmploiSendings = await knex('pole-emploi-sendings').where({ campaignParticipationId });
      expect(poleEmploiSendings.length).to.equal(1);
      expect(poleEmploiSendings[0].responseCode).to.equal(responseCode.toString());
      expect(poleEmploiSendings[0].type).to.equal('CAMPAIGN_PARTICIPATION_COMPLETION');
    });
  });
});
