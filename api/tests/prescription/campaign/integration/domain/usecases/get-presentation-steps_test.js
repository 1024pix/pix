import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { LOCALE } from '../../../../../../src/shared/domain/constants.js';
import {
  databaseBuilder,
  domainBuilder,
  expect,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../../test-helper.js';

const { FRENCH_SPOKEN } = LOCALE;

describe('Integration | Campaign | UseCase | get-presentation-steps', function () {
  let user, campaign, badges, competences;

  beforeEach(async function () {
    const learningContent = domainBuilder.buildLearningContent.withSimpleContent();
    const learningContentObjects = learningContentBuilder.fromAreas(learningContent.frameworks[0].areas);
    await mockLearningContent(learningContentObjects);

    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

    campaign = databaseBuilder.factory.buildCampaign({ targetProfileId });

    user = databaseBuilder.factory.buildUser();

    const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
      userId: user.id,
      campaignId: campaign.id,
    });

    databaseBuilder.factory.buildCampaignParticipation({
      userId: user.id,
      campaignId: campaign.id,
      organizationLearnerId: organizationLearner.id,
    });

    badges = [
      databaseBuilder.factory.buildBadge({ targetProfileId }),
      databaseBuilder.factory.buildBadge({ targetProfileId }),
    ];

    competences = learningContentObjects.competences;

    databaseBuilder.factory.buildCampaignSkill({
      campaignId: campaign.id,
      skillId: competences[0].skillIds[0],
    });

    await databaseBuilder.commit();
  });

  it('should get campaign presentation steps content', async function () {
    // when
    const result = await usecases.getPresentationSteps({
      userId: user.id,
      campaignCode: campaign.code,
      locale: FRENCH_SPOKEN,
    });

    // then
    expect(result.customLandingPageText).to.equal(campaign.customLandingPageText);
    expect(result.badges).to.deep.equal(badges);
    expect(result.competences).to.have.lengthOf(competences.length);
    expect(result.competences[0].id).to.equal(competences[0].id);
    expect(result.competences[0].index).to.equal(competences[0].index);
    expect(result.competences[0].name).to.equal(competences[0].name);
  });
});
