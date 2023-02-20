import {
  expect,
  databaseBuilder,
  knex,
  mockLearningContent,
  learningContentBuilder,
  sinon,
} from '../../../test-helper';

import handlePoleEmploiParticipationFinished from '../../../../lib/domain/events/handle-pole-emploi-participation-finished';
import assessmentRepository from '../../../../lib/infrastructure/repositories/assessment-repository';
import campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository';
import campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository';
import organizationRepository from '../../../../lib/infrastructure/repositories/organization-repository';
import poleEmploiSendingRepository from '../../../../lib/infrastructure/repositories/pole-emploi-sending-repository';
import targetProfileRepository from '../../../../lib/infrastructure/repositories/target-profile-repository';
import userRepository from '../../../../lib/infrastructure/repositories/user-repository';
import AsessmentCompletedEvent from '../../../../lib/domain/events/AssessmentCompleted';

describe('Integration | Event | Handle Pole emploi participation finished', function () {
  let campaignParticipationId, userId, event, poleEmploiNotifier, responseCode;

  describe('#handlePoleEmploiParticipationFinished', function () {
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
      event = new AsessmentCompletedEvent();
      event.campaignParticipationId = campaignParticipationId;

      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas([]);
      mockLearningContent(learningContentObjects);

      return databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('pole-emploi-sendings').delete();
    });

    it('should notify pole emploi and save success of this notification', async function () {
      // when
      await handlePoleEmploiParticipationFinished({
        event,
        assessmentRepository,
        campaignRepository,
        campaignParticipationRepository,
        organizationRepository,
        poleEmploiSendingRepository,
        targetProfileRepository,
        userRepository,
        poleEmploiNotifier,
      });

      // then
      const poleEmploiSendings = await knex('pole-emploi-sendings').where({ campaignParticipationId });
      expect(poleEmploiSendings.length).to.equal(1);
      expect(poleEmploiSendings[0].responseCode).to.equal(responseCode.toString());
      expect(poleEmploiSendings[0].type).to.equal('CAMPAIGN_PARTICIPATION_COMPLETION');
    });
  });
});
