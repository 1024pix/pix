import { expect } from 'chai';

import { CampaignCompetence } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignCompetence.js';
import { CampaignOverviewWithCompetences } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignOverviewWithCompetences.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.ts';
import { MAX_REACHABLE_LEVEL, PIX_ORIGIN } from '../../../../../../src/shared/constants.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | get-campaign-overview', function () {
  const locale = 'fr-FR';

  beforeEach(async function () {
    databaseBuilder.factory.learningContent.buildFramework({ id: 'recFramework1', name: PIX_ORIGIN });
    databaseBuilder.factory.learningContent.buildFramework({ id: 'recFramework2', name: 'Pix+' });
    databaseBuilder.factory.learningContent.buildArea({
      id: 'recArea1',
      code: '1',
      frameworkId: 'recFramework1',
      competenceIds: ['recCompetence1', 'recCompetence2'],
    });
    databaseBuilder.factory.learningContent.buildArea({
      id: 'recArea2',
      code: '2',
      frameworkId: 'recFramework2',
      competenceIds: ['recCompetenceOtherFramework'],
    });
    databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence1',
      index: '1.1',
      name_i18n: { fr: 'Mener une recherche', en: 'Search' },
      origin: PIX_ORIGIN,
      areaId: 'recArea1',
    });
    databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence2',
      index: '1.2',
      name_i18n: { fr: 'Gérer des données', en: 'Manage data' },
      origin: PIX_ORIGIN,
      areaId: 'recArea1',
    });
    databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetenceOtherFramework',
      index: '1.1',
      name_i18n: { fr: 'Autre compétence', en: 'Other competence' },
      origin: 'Pix+',
      areaId: 'recArea2',
    });
    databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic1',
      competenceId: 'recCompetence1',
      tubeIds: ['recTube1', 'recTube2'],
    });
    databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic2',
      competenceId: 'recCompetence2',
      tubeIds: ['recTube3'],
    });
    databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube1',
      competenceId: 'recCompetence1',
      thematicId: 'recThematic1',
    });
    databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube2',
      competenceId: 'recCompetence1',
      thematicId: 'recThematic1',
    });
    databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube3',
      competenceId: 'recCompetence2',
      thematicId: 'recThematic2',
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'recSkill1',
      status: 'actif',
      level: 1,
      tubeId: 'recTube1',
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'recSkill2',
      status: 'actif',
      level: 4,
      tubeId: 'recTube1',
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'recSkill3',
      status: 'actif',
      level: 3,
      tubeId: 'recTube2',
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'recSkill4',
      status: 'actif',
      level: 2,
      tubeId: 'recTube3',
    });
    await databaseBuilder.commit();
  });

  it('returns null when the campaign does not exist', async function () {
    // when
    const result = await usecases.getCampaignOverview({ campaignId: 123456, locale });

    // then
    expect(result).to.be.null;
  });

  it('returns the campaign overview', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization({ name: 'Pix organization' }).id;
    const targetProfileId = databaseBuilder.factory.buildTargetProfile({ description: 'Parcours rentrée 6ieme' }).id;
    const campaign = databaseBuilder.factory.buildCampaign({
      code: 'AZERTY',
      name: 'Campagne 6A',
      type: 'ASSESSMENT',
      organizationId,
      targetProfileId,
    });
    databaseBuilder.factory.buildCampaign({ organizationId });
    databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recSkill1' });
    await databaseBuilder.commit();

    // when
    const campaignOverview = await usecases.getCampaignOverview({ campaignId: campaign.id, locale });

    // then
    expect(campaignOverview).to.be.an.instanceOf(CampaignOverviewWithCompetences);
    expect(campaignOverview).to.include({
      id: campaign.id,
      code: 'AZERTY',
      name: 'Campagne 6A',
      type: 'ASSESSMENT',
      organizationId,
      organizationName: 'Pix organization',
      description: 'Parcours rentrée 6ieme',
    });
  });

  context('when the campaign is an ASSESSMENT campaign', function () {
    it('returns the target profile competences with the average of their tubes max level', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });
      ['recSkill1', 'recSkill2', 'recSkill3', 'recSkill4'].forEach((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId }),
      );
      await databaseBuilder.commit();

      // when
      const result = await usecases.getCampaignOverview({ campaignId: campaign.id, locale });

      // then
      expect(result.id).to.equal(campaign.id);
      expect(result.type).to.equal(CampaignTypes.ASSESSMENT);
      expect(result.competences[0]).to.be.an.instanceOf(CampaignCompetence);
      expect(result.competences).to.deep.equal([
        { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3.5 },
        { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 2 },
      ]);
    });
  });

  context('when the campaign is a PROFILES_COLLECTION campaign', function () {
    it('returns all Pix competences with MAX_REACHABLE_LEVEL as max level', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.PROFILES_COLLECTION,
        targetProfileId: null,
      });
      await databaseBuilder.commit();

      // when
      const result = await usecases.getCampaignOverview({ campaignId: campaign.id, locale });

      // then
      expect(result.id).to.equal(campaign.id);
      expect(result.type).to.equal(CampaignTypes.PROFILES_COLLECTION);
      expect(result.competences[0]).to.be.an.instanceOf(CampaignCompetence);
      expect(result.competences).to.deep.equal([
        { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: MAX_REACHABLE_LEVEL },
        { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: MAX_REACHABLE_LEVEL },
      ]);
    });
  });

  context('when the campaign is an EXAM campaign', function () {
    it('returns the target profile competences with the average of their tubes max level', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.EXAM });
      ['recSkill1', 'recSkill2', 'recSkill3', 'recSkill4'].forEach((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId }),
      );
      await databaseBuilder.commit();

      // when
      const result = await usecases.getCampaignOverview({ campaignId: campaign.id, locale });

      // then
      expect(result.id).to.equal(campaign.id);
      expect(result.type).to.equal(CampaignTypes.EXAM);
      expect(result.competences[0]).to.be.an.instanceOf(CampaignCompetence);
      expect(result.competences).to.deep.equal([
        { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3.5 },
        { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 2 },
      ]);
    });
  });
});
