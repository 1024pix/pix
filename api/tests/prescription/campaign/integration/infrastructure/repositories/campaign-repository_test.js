import _ from 'lodash';

import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import * as campaignRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-repository.js';
import { CampaignExternalIdTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { CAMPAIGN_FEATURES } from '../../../../../../src/shared/constants.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Repository | Campaign', function () {
  describe('#areKnowledgeElementsResettable', function () {
    [
      { multipleSendings: true, areKnowledgeElementsResettable: true, expected: true },
      { multipleSendings: true, areKnowledgeElementsResettable: false, expected: false },
      { multipleSendings: false, areKnowledgeElementsResettable: true, expected: false },
      { multipleSendings: false, areKnowledgeElementsResettable: false, expected: false },
    ].forEach(({ multipleSendings, areKnowledgeElementsResettable, expected }) => {
      it(`should return ${expected} if campaign multipleSendings equal ${multipleSendings} and target profiles areKnowledgeElementsResettable equal ${areKnowledgeElementsResettable}`, async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile({ areKnowledgeElementsResettable }).id;

        const campaignId = databaseBuilder.factory.buildCampaign({
          code: 'BADOIT710',
          multipleSendings,
          targetProfileId,
          type: 'ASSESSMENT',
        }).id;
        await databaseBuilder.commit();

        // when
        const canReset = await campaignRepository.areKnowledgeElementsResettable({
          id: campaignId,
        });

        // then
        expect(canReset).to.equal(expected);
      });
    });
  });

  describe('#findSkillIdsByCampaignParticipationIds', function () {
    it('should return empty array', async function () {
      const skillIds = await campaignRepository.findSkillIdsByCampaignParticipationIds({
        campaignParticipationIds: [123, 456],
      });

      // then
      expect(skillIds).to.have.lengthOf(0);
    });

    it('should return the operative skillIds for the campaign participations', async function () {
      // given
      databaseBuilder.factory.learningContent.buildSkill({ id: 'skillId1', status: 'actif' });
      databaseBuilder.factory.learningContent.buildSkill({ id: 'skillId2', status: 'actif' });
      databaseBuilder.factory.learningContent.buildSkill({ id: 'skillId3', status: 'archivé' });
      databaseBuilder.factory.learningContent.buildSkill({ id: 'skillId4', status: 'périmé' });

      const campaignId1 = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillId1', campaignId: campaignId1 });
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillId2', campaignId: campaignId1 });
      const campaignId2 = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillId1', campaignId: campaignId2 });
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillId3', campaignId: campaignId2 });
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillId4', campaignId: campaignId2 });

      const campaignParticipationIds = [
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaignId1 }).id,
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaignId2 }).id,
      ];
      await databaseBuilder.commit();

      // when
      const skillIds = await campaignRepository.findSkillIdsByCampaignParticipationIds({ campaignParticipationIds });

      // then
      expect(skillIds).to.have.lengthOf(3);
      expect(skillIds).to.have.members(['skillId1', 'skillId2', 'skillId3']);
    });
  });

  describe('#findSkillIdsByCampaignParticipationId', function () {
    it('should return empty array', async function () {
      const skillIds = await campaignRepository.findSkillIdsByCampaignParticipationId({
        campaignParticipationId: 123,
      });

      // then
      expect(skillIds).to.have.lengthOf(0);
    });

    it('should return the skillIds for the campaign participation', async function () {
      // given
      databaseBuilder.factory.learningContent.buildSkill({ id: 'skillId1', status: 'actif' });
      databaseBuilder.factory.learningContent.buildSkill({ id: 'skillId2', status: 'archivé' });
      databaseBuilder.factory.learningContent.buildSkill({ id: 'skillId3', status: 'actif' });
      databaseBuilder.factory.learningContent.buildSkill({ id: 'skillId4', status: 'périmé' });

      const campaignId1 = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillId1', campaignId: campaignId1 });
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillId2', campaignId: campaignId1 });
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillId4', campaignId: campaignId1 });
      const campaignId2 = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillId1', campaignId: campaignId2 });
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillId3', campaignId: campaignId2 });

      const campaignParticipationIds = [
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaignId1 }).id,
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaignId2 }).id,
      ];
      await databaseBuilder.commit();

      // when
      const skillIds = await campaignRepository.findSkillIdsByCampaignParticipationId({
        campaignParticipationId: campaignParticipationIds[0],
      });

      // then
      expect(skillIds).to.have.lengthOf(2);
      expect(skillIds).to.have.members(['skillId1', 'skillId2']);
    });
  });

  describe('#findTubes', function () {
    it('should return the tubes for the campaign', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'toto' });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tata' });
      databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'foo' });

      const campaignId = databaseBuilder.factory.buildCampaign({
        code: 'BADOIT710',
        multipleSendings: true,
        targetProfileId,
        type: 'ASSESSMENT',
      }).id;
      await databaseBuilder.commit();

      // when
      const tubes = await campaignRepository.findTubes({ campaignId });

      // then
      expect(tubes).to.have.lengthOf(2);
      expect(tubes).to.have.members(['toto', 'tata']);
    });
  });

  describe('#findAllSkills', function () {
    it('should return the skills for the campaign', async function () {
      // given
      databaseBuilder.factory.learningContent.buildFramework({ id: 'frameworkId', name: 'someFramework' });
      databaseBuilder.factory.learningContent.buildArea({ id: 'areaId', frameworkId: 'frameworkId' });
      databaseBuilder.factory.learningContent.buildCompetence({ id: 'competenceId', areaId: 'areaId' });
      databaseBuilder.factory.learningContent.buildThematic({
        id: 'thematicId',
        competenceId: 'competenceId',
        tubeIds: ['tubeId1', 'tubeId2', 'tubeId3'],
      });
      databaseBuilder.factory.learningContent.buildTube({
        id: 'tubeId1',
        competenceId: 'competenceId',
        skillIds: ['recSK123'],
      });
      databaseBuilder.factory.learningContent.buildTube({
        id: 'tubeId2',
        competenceId: 'competenceId',
        skillIds: ['recSK456'],
      });
      databaseBuilder.factory.learningContent.buildTube({
        id: 'tubeId3',
        competenceId: 'competenceId',
        skillIds: ['recSK789'],
      });
      const skill1DB = databaseBuilder.factory.learningContent.buildSkill({
        id: 'recSK123',
        name: '@sau3',
        pixValue: 3,
        competenceId: 'competenceId',
        tutorialIds: [],
        learningMoreTutorialIds: [],
        tubeId: 'tubeId1',
        version: 1,
        level: 3,
      });
      const skill2DB = databaseBuilder.factory.learningContent.buildSkill({
        id: 'recSK456',
        name: '@sau4',
        pixValue: 3,
        competenceId: 'competenceId',
        tutorialIds: [],
        learningMoreTutorialIds: [],
        tubeId: 'tubeId2',
        version: 1,
        level: 4,
      });
      databaseBuilder.factory.learningContent.buildSkill({
        id: 'recSK789',
        name: '@sau7',
        pixValue: 3,
        competenceId: 'competenceId',
        tutorialIds: [],
        learningMoreTutorialIds: [],
        tubeId: 'tubeId3',
        version: 1,
        level: 7,
      });
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tubeId1' });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tubeId2' });
      databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'tubeId3' });

      const campaignId = databaseBuilder.factory.buildCampaign({
        code: 'BADOIT710',
        multipleSendings: true,
        targetProfileId,
        type: 'ASSESSMENT',
      }).id;
      await databaseBuilder.commit();

      // When
      const skills = await campaignRepository.findAllSkills({ campaignId });

      // Then
      expect(skills).to.have.lengthOf(2);
      const expectedSkill1 = domainBuilder.buildSkill({
        ...skill1DB,
        difficulty: skill1DB.level,
        hint: skill1DB.hint_i18n.fr,
      });
      const expectedSkill2 = domainBuilder.buildSkill({
        ...skill2DB,
        difficulty: skill2DB.level,
        hint: skill2DB.hint_i18n.fr,
      });
      expect(skills).to.have.deep.members([expectedSkill1, expectedSkill2]);
    });
  });

  describe('#getByCode', function () {
    let campaign;

    beforeEach(async function () {
      campaign = databaseBuilder.factory.buildCampaign({
        code: 'BADOIT710',
        createdAt: new Date('2018-02-06T14:12:45Z'),
        externalIdHelpImageUrl: 'some url',
        alternativeTextToExternalIdHelpImage: 'alternative text',
      });
      await databaseBuilder.commit();
    });

    it('should resolve the campaign relies to the code', async function () {
      // when
      const actualCampaign = await campaignRepository.getByCode('BADOIT710');

      // then
      const checkedAttributes = [
        'id',
        'name',
        'code',
        'type',
        'createdAt',
        'archivedAt',
        'customLandingPageText',
        'externalIdHelpImageUrl',
        'alternativeTextToExternalIdHelpImage',
        'title',
      ];
      expect(_.pick(actualCampaign, checkedAttributes)).to.deep.equal(_.pick(campaign, checkedAttributes));
    });

    it('should resolve null if the code do not correspond to any campaign ', async function () {
      // when
      const result = await campaignRepository.getByCode('BIDULEFAUX');

      // then
      expect(result).to.be.null;
    });
  });

  describe('#get', function () {
    let campaign;

    beforeEach(function () {
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ id: 2 });
      const campaignData = databaseBuilder.factory.buildCampaign({ id: 1, name: 'My campaign', targetProfile });
      campaign = domainBuilder.buildCampaign(campaignData);

      return databaseBuilder.commit();
    });

    it('should return a Campaign by its id', async function () {
      // when
      const result = await campaignRepository.get(campaign.id);

      // then
      expect(result).to.be.an.instanceof(Campaign);
      expect(result.name).to.equal(campaign.name);
    });

    it('should return a Campaign with externalIdLabel by its id ', async function () {
      // when
      const feature = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.EXTERNAL_ID);
      databaseBuilder.factory.buildCampaignFeature({
        featureId: feature.id,
        campaignId: campaign.id,
        params: { label: 'identifiant pix', type: CampaignExternalIdTypes.STRING },
      });
      await databaseBuilder.commit();

      const result = await campaignRepository.get(campaign.id);

      // then
      expect(result).to.be.an.instanceof(Campaign);
      expect(result.name).to.equal(campaign.name);
      expect(result.externalIdLabel).to.equal('identifiant pix');
      expect(result.externalIdType).to.equal(CampaignExternalIdTypes.STRING);
    });

    it('should throw a NotFoundError if campaign can not be found', function () {
      // given
      const nonExistentId = 666;
      // when
      const promise = campaignRepository.get(nonExistentId);
      // then
      return expect(promise).to.have.been.rejectedWith(NotFoundError);
    });
  });

  describe('#checkIfUserOrganizationHasAccessToCampaign', function () {
    let userId,
      ownerId,
      organizationId,
      userWithDisabledMembershipId,
      forbiddenUserId,
      forbiddenOrganizationId,
      campaignId;

    beforeEach(async function () {
      // given
      userId = databaseBuilder.factory.buildUser().id;
      ownerId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization({ userId: ownerId }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      forbiddenUserId = databaseBuilder.factory.buildUser().id;
      forbiddenOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId: forbiddenUserId, organizationId: forbiddenOrganizationId });

      userWithDisabledMembershipId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        userId: userWithDisabledMembershipId,
        organizationId,
        disabledAt: new Date('2020-01-01'),
      });

      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

      await databaseBuilder.commit();
    });

    it('should return true when the user is a member of an organization that owns the campaign', async function () {
      //when
      const access = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

      //then
      expect(access).to.be.true;
    });

    it('should return false when the user is not a member of an organization that owns campaign', async function () {
      //when
      const access = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, forbiddenUserId);

      //then
      expect(access).to.be.false;
    });

    it('should return false when the user is a disabled membership of the organization that owns campaign', async function () {
      //when
      const access = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(
        campaignId,
        userWithDisabledMembershipId,
      );

      //then
      expect(access).to.be.false;
    });
  });

  describe('#getCampaignIdByCampaignParticipationId', function () {
    it('should return campaign id', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
      }).id;
      await databaseBuilder.commit();

      // when
      const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(campaignParticipationId);

      // then
      expect(campaignId).to.equal(campaign.id);
    });

    it('should return null when campaignParticipationId does not exist', async function () {
      // when
      const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(123);

      // then
      expect(campaignId).to.be.null;
    });

    it('should return the campaign id from the given campaignParticipationId', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
      }).id;

      const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
      });
      await databaseBuilder.commit();

      // when
      const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(campaignParticipationId);

      // then
      expect(campaignId).to.equal(campaign.id);
    });
  });

  describe('#getByCampaignParticipationId', function () {
    it('should return campaign id', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
      }).id;
      await databaseBuilder.commit();

      // when
      const result = await campaignRepository.getByCampaignParticipationId(campaignParticipationId);

      // then
      expect(result).to.deep.equal(new Campaign(campaign));
    });

    it('should return null when campaignParticipationId does not exist', async function () {
      // when
      const campaign = await campaignRepository.getCampaignIdByCampaignParticipationId(123);

      // then
      expect(campaign).to.be.null;
    });

    it('should return the campaign id from the given campaignParticipationId', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
      }).id;

      const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignRepository.getByCampaignParticipationId(campaignParticipationId);

      // then
      expect(result.id).to.equal(campaign.id);
    });
  });
});
