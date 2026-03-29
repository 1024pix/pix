import sinon from 'sinon';

import { Skill } from '../../../../../src/quest/domain/models/Skill.js';
import { Success } from '../../../../../src/quest/domain/models/Success.js';
import * as successRepository from '../../../../../src/quest/infrastructure/repositories/success-repository.js';
import { expect, preventStubsToBeCalledUnexpectedly } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | repositories | success', function () {
  describe('#find', function () {
    let knowledgeElementsApi_findFilteredMostRecentByUserStub;
    let skillsApi_findInIdsStub;
    let campaignsApi_findCampaignSkillIdsForCampaignParticipationsStub;
    let targetProfilesApi_findSkillsByTargetProfileIdsStub;

    beforeEach(function () {
      knowledgeElementsApi_findFilteredMostRecentByUserStub = sinon.stub().named('findFilteredMostRecentByUser');
      skillsApi_findInIdsStub = sinon.stub().named('findInIds');
      campaignsApi_findCampaignSkillIdsForCampaignParticipationsStub = sinon
        .stub()
        .named('findCampaignSkillIdsForCampaignParticipations');
      targetProfilesApi_findSkillsByTargetProfileIdsStub = sinon.stub();
      preventStubsToBeCalledUnexpectedly([
        knowledgeElementsApi_findFilteredMostRecentByUserStub,
        skillsApi_findInIdsStub,
        campaignsApi_findCampaignSkillIdsForCampaignParticipationsStub,
        targetProfilesApi_findSkillsByTargetProfileIdsStub,
      ]);
    });

    it('should return a Success model according to data fetched from diverse APIs', async function () {
      // given
      const userId = Symbol('userId');
      const knowledgeElements = [{ skillId: 'A' }, { skillId: 'B' }];
      const campaignParticipationIds = Symbol('campaignParticipationIds');
      const targetProfileIds = Symbol('targetProfileIds');
      const campaignSkillIds = Symbol('campaignSkillIds');
      const baseSkills = [{ id: 'A', tubeId: 'AA' }];
      const targetProfileSkills = [{ id: 'B', tubeId: 'BB' }];
      const knowledgeElementsApi = {
        findFilteredMostRecentByUser: knowledgeElementsApi_findFilteredMostRecentByUserStub,
      };
      const skillsApi = {
        findInIds: skillsApi_findInIdsStub,
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
      skillsApi_findInIdsStub.withArgs({ ids: campaignSkillIds }).resolves(baseSkills);
      targetProfilesApi_findSkillsByTargetProfileIdsStub.withArgs(targetProfileIds).resolves(targetProfileSkills);

      // when
      const result = await successRepository.find({
        userId,
        targetProfileIds,
        campaignParticipationIds,
        targetProfilesApi,
        knowledgeElementsApi,
        campaignsApi,
        skillsApi,
      });

      // then
      expect(result).to.be.an.instanceof(Success);
      expect(result.knowledgeElements).to.deepEqualArray(knowledgeElements);
      expect(result.skills).to.deepEqualArray([
        new Skill({ id: 'A', tubeId: 'AA' }),
        new Skill({ id: 'B', tubeId: 'BB' }),
      ]);
    });
  });
});
