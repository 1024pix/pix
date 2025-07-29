import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Campaign | UseCase | get-presentation-steps', function () {
  let user, campaign, badges;

  beforeEach(async function () {
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

    databaseBuilder.factory.learningContent.buildFramework({
      id: 'recFramework',
    });
    databaseBuilder.factory.learningContent.buildArea({
      id: 'recArea',
      frameworkId: 'recFramework',
      competenceIds: ['recCompetence'],
    });
    databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence',
      index: '2',
      name_i18n: { fr: 'nom en français' },
      areaId: 'recArea',
      skillIds: ['recSkill'],
      thematicIds: ['recThematic'],
    });
    databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic',
      competenceId: 'recCompetence',
      tubeIds: ['recTube'],
    });
    databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube',
      competenceId: 'recCompetence',
      thematicId: 'recThematic',
      skillIds: ['recSkill'],
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'recSkill',
      status: 'actif',
      competenceId: 'recCompetence',
      tubeId: 'recTube',
    });
    databaseBuilder.factory.buildCampaignSkill({
      campaignId: campaign.id,
      skillId: 'recSkill',
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
    expect(result.competences).to.have.lengthOf(1);
    expect(result.competences[0].id).to.equal('recCompetence');
    expect(result.competences[0].index).to.equal('2');
    expect(result.competences[0].name).to.equal('nom en français');
  });
});
