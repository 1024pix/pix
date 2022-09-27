const {
  expect,
  databaseBuilder,
  knex,
  mockLearningContent,
  learningContentBuilder,
  sinon,
} = require('../../../../test-helper');
const SendSharedParticipationResultsToPoleEmploiHandler = require('../../../../../lib/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiHandler');
const assessmentRepository = require('../../../../../lib/infrastructure/repositories/assessment-repository');
const campaignRepository = require('../../../../../lib/infrastructure/repositories/campaign-repository');
const campaignParticipationRepository = require('../../../../../lib/infrastructure/repositories/campaign-participation-repository');
const campaignParticipationResultRepository = require('../../../../../lib/infrastructure/repositories/campaign-participation-result-repository');
const organizationRepository = require('../../../../../lib/infrastructure/repositories/organization-repository');
const poleEmploiSendingRepository = require('../../../../../lib/infrastructure/repositories/pole-emploi-sending-repository');
const targetProfileRepository = require('../../../../../lib/infrastructure/repositories/target-profile-repository');
const userRepository = require('../../../../../lib/infrastructure/repositories/user-repository');
const CampaignParticipationResultsSharedEvent = require('../../../../../lib/domain/events/CampaignParticipationResultsShared');

describe('Integration | Jon | SendSharedParticipationResultsToPoleEmploi', function () {
  let campaignParticipationId, userId, event, poleEmploiNotifier, responseCode;

  describe('#handle', function () {
    beforeEach(async function () {
      responseCode = Symbol('responseCode');
      poleEmploiNotifier = { notify: sinon.stub().resolves({ isSuccessful: true, code: responseCode }) };

      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId });
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId });

      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const tagId = databaseBuilder.factory.buildTag({ name: 'POLE EMPLOI' }).id;
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId, organizationId }).id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId }).id;
      databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
      event = new CampaignParticipationResultsSharedEvent();
      event.campaignParticipationId = campaignParticipationId;

      const learningContentObjects = learningContentBuilder.buildLearningContent([]);
      mockLearningContent(learningContentObjects);

      return databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('pole-emploi-sendings').delete();
    });

    it('should notify pole emploi and save success of this notification', async function () {
      //given
      const sendSharedParticipationResultsToPoleEmploiHandler = new SendSharedParticipationResultsToPoleEmploiHandler({
        assessmentRepository,
        campaignRepository,
        campaignParticipationRepository,
        campaignParticipationResultRepository,
        organizationRepository,
        poleEmploiSendingRepository,
        targetProfileRepository,
        userRepository,
        poleEmploiNotifier,
      });
      // when
      await sendSharedParticipationResultsToPoleEmploiHandler.handle(event);

      // then
      const poleEmploiSendings = await knex('pole-emploi-sendings').where({ campaignParticipationId });
      expect(poleEmploiSendings.length).to.equal(1);
      expect(poleEmploiSendings[0].responseCode).to.equal(responseCode.toString());
      expect(poleEmploiSendings[0].type).to.equal('CAMPAIGN_PARTICIPATION_SHARING');
    });
  });
});
