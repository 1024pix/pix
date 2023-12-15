import { databaseBuilder, domainBuilder, expect, mockLearningContent } from '../../../test-helper.js';

import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import { Campaign } from '../../../../lib/domain/models/Campaign.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import _ from 'lodash';
import { buildLearningContent } from '../../../tooling/learning-content-builder/build-learning-content.js';
import { buildFramework } from '../../../tooling/domain-builder/factory/build-framework.js';
import { buildSkill } from '../../../tooling/domain-builder/factory/build-skill.js';
import { buildTube } from '../../../tooling/domain-builder/factory/build-tube.js';
import { buildArea } from '../../../tooling/domain-builder/factory/build-area.js';
import { buildCompetence } from '../../../tooling/domain-builder/factory/build-competence.js';
import { buildThematic } from '../../../tooling/domain-builder/factory/build-thematic.js';

describe('Integration | Repository | Campaign', function () {
  describe('#areKnowledgeElementsResettable', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
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
      const framework = buildFramework({ id: 'frameworkId', name: 'someFramework' });
      const competenceId = 'competenceId';
      const skill1 = {
        id: 'recSK123',
        name: '@sau3',
        pixValue: 3,
        competenceId,
        tutorialIds: [],
        learningMoreTutorialIds: [],
        tubeId: 'tubeId1',
        version: 1,
        level: 3,
      };
      const skill2 = {
        id: 'recSK456',
        name: '@sau4',
        pixValue: 3,
        competenceId,
        tutorialIds: [],
        learningMoreTutorialIds: [],
        tubeId: 'tubeId2',
        version: 1,
        level: 4,
      };
      const skill3 = {
        id: 'recSK789',
        name: '@sau7',
        pixValue: 3,
        competenceId,
        tutorialIds: [],
        learningMoreTutorialIds: [],
        tubeId: 'tubeId3',
        version: 1,
        level: 7,
      };
      const tube1 = buildTube({ id: 'tubeId1', competenceId, skills: [skill1] });
      const tube2 = buildTube({ id: 'tubeId2', competenceId, skills: [skill2] });
      const tube3 = buildTube({ id: 'tubeId3', competenceId, skills: [skill3] });
      const area = buildArea({ id: 'areaId', frameworkId: framework.id });
      const competence = buildCompetence({ id: 'competenceId', area, tubes: [tube1, tube2, tube3] });
      const thematic = buildThematic({
        id: 'thematicId',
        competenceId: 'competenceId',
        tubeIds: ['tubeId1', 'tubeId2', 'tubeId3'],
      });
      competence.thematics = [thematic];
      area.competences = [competence];
      framework.areas = [area];
      const learningContent = buildLearningContent([framework]);
      mockLearningContent(learningContent);

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
      const expectedSkill1 = buildSkill({ ...skill1, difficulty: skill1.level });
      const expectedSkill2 = buildSkill({ ...skill2, difficulty: skill2.level });
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
        'idPixLabel',
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
      const bookshelfCampaign = databaseBuilder.factory.buildCampaign({ id: 1, name: 'My campaign', targetProfile });
      campaign = domainBuilder.buildCampaign(bookshelfCampaign);

      return databaseBuilder.commit();
    });

    it('should return a Campaign by her id', async function () {
      // when
      const result = await campaignRepository.get(campaign.id);

      // then
      expect(result).to.be.an.instanceof(Campaign);
      expect(result.name).to.equal(campaign.name);
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

  describe('#getCampaignTitleByCampaignParticipationId', function () {
    it('should return campaign title when campaign has one', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ title: 'Parcours trop bien' }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const title = await campaignRepository.getCampaignTitleByCampaignParticipationId(campaignParticipationId);

      // then
      expect(title).to.equal('Parcours trop bien');
    });

    it('should return null when campaign has no title', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ title: null }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const title = await campaignRepository.getCampaignTitleByCampaignParticipationId(campaignParticipationId);

      // then
      expect(title).to.be.null;
    });

    it('should return null when campaignParticipationId does not exist', async function () {
      // when
      const title = await campaignRepository.getCampaignTitleByCampaignParticipationId(123);

      // then
      expect(title).to.be.null;
    });

    it('should return the title from the given campaignParticipationId', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ title: 'Parcours trop bien' }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId });

      const otherCampaignId = databaseBuilder.factory.buildCampaign({ title: 'Autre' }).id;
      const otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
      }).id;
      await databaseBuilder.commit();

      // when
      const title = await campaignRepository.getCampaignTitleByCampaignParticipationId(otherCampaignParticipationId);

      // then
      expect(title).to.equal('Autre');
    });
  });

  describe('#getCampaignCodeByCampaignParticipationId', function () {
    it('should return campaign code when campaign has one', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ code: 'CAMPAIGN1' }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const code = await campaignRepository.getCampaignCodeByCampaignParticipationId(campaignParticipationId);

      // then
      expect(code).to.equal('CAMPAIGN1');
    });

    it('should return null when campaignParticipationId does not exist', async function () {
      // when
      const code = await campaignRepository.getCampaignCodeByCampaignParticipationId(123);

      // then
      expect(code).to.be.null;
    });

    it('should return the code from the given campaignParticipationId', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ code: 'CAMPAIGN1' }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId });

      const otherCampaignId = databaseBuilder.factory.buildCampaign({ code: 'CAMPAIGN2' }).id;
      const otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
      }).id;
      await databaseBuilder.commit();

      // when
      const code = await campaignRepository.getCampaignCodeByCampaignParticipationId(otherCampaignParticipationId);

      // then
      expect(code).to.equal('CAMPAIGN2');
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
});
