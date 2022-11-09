const {
  expect,
  databaseBuilder,
  knex,
  mockLearningContent,
  learningContentBuilder,
  sinon,
} = require('../../../test-helper');
const useCases = require('../../../../lib/domain/usecases');
const poleEmploiNotifier = require('../../../../lib/infrastructure/externals/pole-emploi/pole-emploi-notifier');

describe('Integration | Domain | UseCases | send-shared-participation-results-to-pole-emploi', function () {
  let campaignParticipationId, userId, responseCode;

  beforeEach(async function () {
    responseCode = Symbol('responseCode');
    sinon.stub(poleEmploiNotifier, 'notify');
    poleEmploiNotifier.notify.resolves({ isSuccessful: true, code: responseCode });

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

    const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas([]);
    mockLearningContent(learningContentObjects);
    return databaseBuilder.commit();
  });

  afterEach(async function () {
    await knex('pole-emploi-sendings').delete();
  });

  it('should notify pole emploi and save success of this notification', async function () {
    await useCases.sendSharedParticipationResultsToPoleEmploi({ campaignParticipationId });

    const poleEmploiSendings = await knex('pole-emploi-sendings').where({ campaignParticipationId });
    expect(poleEmploiSendings.length).to.equal(1);
    expect(poleEmploiSendings[0].responseCode).to.equal(responseCode.toString());
    expect(poleEmploiSendings[0].type).to.equal('CAMPAIGN_PARTICIPATION_SHARING');
  });
});
