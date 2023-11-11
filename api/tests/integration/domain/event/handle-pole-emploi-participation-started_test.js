import {
  expect,
  databaseBuilder,
  knex,
  mockLearningContent,
  learningContentBuilder,
  sinon,
} from '../../../test-helper.js';

import { handlePoleEmploiParticipationStarted } from '../../../../lib/domain/events/handle-pole-emploi-participation-started.js';
import * as assessmentRepository from '../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import * as organizationRepository from '../../../../lib/infrastructure/repositories/organization-repository.js';
import * as poleEmploiSendingRepository from '../../../../lib/infrastructure/repositories/pole-emploi-sending-repository.js';
import * as targetProfileRepository from '../../../../lib/infrastructure/repositories/target-profile-repository.js';
import * as userRepository from '../../../../src/shared/infrastructure/repositories/user-repository.js';
import { CampaignParticipationStarted as CampaignParticipationStartedEvent } from '../../../../lib/domain/events/CampaignParticipationStarted.js';

describe('Integration | Event | Handle Pole emploi participation started', function () {
  let campaignParticipationId, userId, event, poleEmploiNotifier, responseCode;

  describe('#handlePoleEmploiParticipationStarted', function () {
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
      event = new CampaignParticipationStartedEvent();
      event.campaignParticipationId = campaignParticipationId;

      const learningContentObjects = learningContentBuilder.fromAreas([]);
      mockLearningContent(learningContentObjects);

      return databaseBuilder.commit();
    });

    it('should notify pole emploi and save success of this notification', async function () {
      // when
      await handlePoleEmploiParticipationStarted({
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
      expect(poleEmploiSendings[0].type).to.equal('CAMPAIGN_PARTICIPATION_START');
    });
  });
});
