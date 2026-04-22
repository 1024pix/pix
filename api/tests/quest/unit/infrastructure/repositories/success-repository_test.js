import sinon from 'sinon';

import { Success } from '../../../../../src/quest/domain/models/Success.js';
import * as successRepository from '../../../../../src/quest/infrastructure/repositories/success-repository.js';
import { expect } from '../../../../test-helper.js';
import { preventStubsToBeCalledUnexpectedly } from '../../../../tooling/test-utils/error.js';

describe('Quest | Unit | Infrastructure | repositories | success', function () {
  describe('#find', function () {
    let knowledgeElementsApi_findFilteredMostRecentByUserStub;
    let skillsApi_findByIdsStub;
    let campaignsApi_findCampaignSkillIdsForCampaignParticipationsStub;
    let targetProfilesApi_findSkillsByTargetProfileIdsStub;

    beforeEach(function () {
      knowledgeElementsApi_findFilteredMostRecentByUserStub = sinon.stub().named('findFilteredMostRecentByUser');
      skillsApi_findByIdsStub = sinon.stub().named('findByIds');
      campaignsApi_findCampaignSkillIdsForCampaignParticipationsStub = sinon
        .stub()
        .named('findCampaignSkillIdsForCampaignParticipations');
      targetProfilesApi_findSkillsByTargetProfileIdsStub = sinon.stub();
      preventStubsToBeCalledUnexpectedly([
        knowledgeElementsApi_findFilteredMostRecentByUserStub,
        skillsApi_findByIdsStub,
        campaignsApi_findCampaignSkillIdsForCampaignParticipationsStub,
        targetProfilesApi_findSkillsByTargetProfileIdsStub,
      ]);
    });

    it('should not call APIs for data the quest does not need', async function () {
      // given
      const userId = Symbol('userId');
      const campaignParticipationIds = Symbol('campaignParticipationIds');
      const targetProfileIds = Symbol('targetProfileIds');
      const knowledgeElementsApi = {
        findFilteredMostRecentByUser: knowledgeElementsApi_findFilteredMostRecentByUserStub,
      };
      const skillsApi = { findByIds: skillsApi_findByIdsStub };
      const campaignsApi = {
        findCampaignSkillIdsForCampaignParticipations: campaignsApi_findCampaignSkillIdsForCampaignParticipationsStub,
      };
      const targetProfilesApi = { findSkillsByTargetProfileIds: targetProfilesApi_findSkillsByTargetProfileIdsStub };
      const quest = {
        getDataNeeds: sinon.stub().returns({
          needsKnowledgeElements: false,
          needsCampaignSkills: false,
          needsTargetProfileSkills: false,
        }),
      };

      // when
      const result = await successRepository.find({
        userId,
        targetProfileIds,
        campaignParticipationIds,
        quest,
        targetProfilesApi,
        knowledgeElementsApi,
        campaignsApi,
        skillsApi,
      });

      // then
      expect(result).to.be.an.instanceof(Success);
      expect(result.knowledgeElements).to.have.lengthOf(0);
      expect(result.skills).to.have.lengthOf(0);
      sinon.assert.notCalled(knowledgeElementsApi_findFilteredMostRecentByUserStub);
      sinon.assert.notCalled(campaignsApi_findCampaignSkillIdsForCampaignParticipationsStub);
      sinon.assert.notCalled(skillsApi_findByIdsStub);
      sinon.assert.notCalled(targetProfilesApi_findSkillsByTargetProfileIdsStub);
    });

    it('should return a Success model according to data fetched from diverse APIs', async function () {
      // given
      const userId = Symbol('userId');
      const knowledgeElements = [{ skillId: 'A' }, { skillId: 'B' }];
      const campaignParticipationIds = Symbol('campaignParticipationIds');
      const targetProfileIds = Symbol('targetProfileIds');
      const campaignSkillIds = Symbol('campaignSkillIds');
      const campaignSkills = [{ id: 'A', tubeId: 'AA' }];
      const targetProfileSkills = [{ id: 'B', tubeId: 'BB' }];
      const skills = [
        { id: 'A', tubeId: 'AA' },
        { id: 'B', tubeId: 'BB' },
      ];
      const knowledgeElementsApi = {
        findFilteredMostRecentByUser: knowledgeElementsApi_findFilteredMostRecentByUserStub,
      };
      const skillsApi = {
        findByIds: skillsApi_findByIdsStub,
      };
      const targetProfilesApi = {
        findSkillsByTargetProfileIds: targetProfilesApi_findSkillsByTargetProfileIdsStub,
      };
      const campaignsApi = {
        findCampaignSkillIdsForCampaignParticipations: campaignsApi_findCampaignSkillIdsForCampaignParticipationsStub,
      };
      knowledgeElementsApi_findFilteredMostRecentByUserStub.withArgs({ userId }).resolves(knowledgeElements);
      campaignsApi.findCampaignSkillIdsForCampaignParticipations
        .withArgs(campaignParticipationIds)
        .resolves(campaignSkillIds);
      skillsApi_findByIdsStub.withArgs({ ids: campaignSkillIds }).resolves(campaignSkills);
      targetProfilesApi_findSkillsByTargetProfileIdsStub.withArgs(targetProfileIds).resolves(targetProfileSkills);

      const quest = {
        getDataNeeds: sinon.stub().returns({
          needsKnowledgeElements: true,
          needsCampaignSkills: true,
          needsTargetProfileSkills: true,
        }),
      };

      // when
      const result = await successRepository.find({
        userId,
        targetProfileIds,
        campaignParticipationIds,
        quest,
        targetProfilesApi,
        knowledgeElementsApi,
        campaignsApi,
        skillsApi,
      });

      // then
      expect(result).to.be.an.instanceof(Success);
      expect(result.knowledgeElements).to.deepEqualArray(knowledgeElements);
      expect(result.skills).to.deepEqualArray(skills);
    });
  });
});
