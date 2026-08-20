import sinon from 'sinon';

import { Success } from '../../../../../src/quest/domain/models/quests/aggregates/Success.js';
import * as successRepository from '../../../../../src/quest/infrastructure/repositories/success-repository.js';
import { expect } from '../../../../test-helper.js';
import { preventStubsToBeCalledUnexpectedly } from '../../../../tooling/test-utils/error.js';

describe('Quest | Unit | Infrastructure | repositories | success', function () {
  describe('#find', function () {
    let knowledgeStatesApi_getKnowledgeStateForUserStub;
    let skillsApi_findByIdsStub;
    let campaignsApi_findCampaignSkillIdsForCampaignParticipationsStub;
    let targetProfilesApi_findSkillsByTargetProfileIdsStub;

    beforeEach(function () {
      knowledgeStatesApi_getKnowledgeStateForUserStub = sinon.stub().named('getKnowledgeStateForUser');
      skillsApi_findByIdsStub = sinon.stub().named('findByIds');
      campaignsApi_findCampaignSkillIdsForCampaignParticipationsStub = sinon
        .stub()
        .named('findCampaignSkillIdsForCampaignParticipations');
      targetProfilesApi_findSkillsByTargetProfileIdsStub = sinon.stub();
      preventStubsToBeCalledUnexpectedly([
        knowledgeStatesApi_getKnowledgeStateForUserStub,
        skillsApi_findByIdsStub,
        campaignsApi_findCampaignSkillIdsForCampaignParticipationsStub,
        targetProfilesApi_findSkillsByTargetProfileIdsStub,
      ]);
    });

    it('should return a Success model according to data fetched from diverse APIs', async function () {
      // given
      const userId = Symbol('userId');
      const knowledgeState = { validatedSkillIds: ['A'], floorByTubeId: { AA: 1 } };
      const campaignParticipationIds = Symbol('campaignParticipationIds');
      const targetProfileIds = Symbol('targetProfileIds');
      const campaignSkillIds = Symbol('campaignSkillIds');
      const campaignSkills = [{ id: 'A', tubeId: 'AA' }];
      const targetProfileSkills = [{ id: 'B', tubeId: 'BB' }];
      const skills = [
        { id: 'A', tubeId: 'AA' },
        { id: 'B', tubeId: 'BB' },
      ];
      const knowledgeStatesApi = {
        getKnowledgeStateForUser: knowledgeStatesApi_getKnowledgeStateForUserStub,
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
      knowledgeStatesApi_getKnowledgeStateForUserStub.withArgs({ userId }).resolves(knowledgeState);
      campaignsApi.findCampaignSkillIdsForCampaignParticipations
        .withArgs(campaignParticipationIds)
        .resolves(campaignSkillIds);
      skillsApi_findByIdsStub.withArgs({ ids: campaignSkillIds }).resolves(campaignSkills);
      targetProfilesApi_findSkillsByTargetProfileIdsStub.withArgs(targetProfileIds).resolves(targetProfileSkills);

      // when
      const result = await successRepository.find({
        userId,
        targetProfileIds,
        campaignParticipationIds,
        targetProfilesApi,
        knowledgeStatesApi,
        campaignsApi,
        skillsApi,
      });

      // then
      expect(result).to.be.an.instanceof(Success);
      expect(result.knowledgeState).to.deep.equal(knowledgeState);
      expect(result.skills).to.deepEqualArray(skills);
    });
  });
});
