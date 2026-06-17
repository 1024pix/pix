import sinon from 'sinon';

import { RecommendedModule } from '../../../../../src/quest/domain/models/combined-course-participations/value-objects/RecommendedModule.js';
import * as recommendedModuleRepository from '../../../../../src/quest/infrastructure/repositories/recommended-module-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Repositories | Recommended Module Repository', function () {
  describe('#findIdsByTargetProfileIds', function () {
    it('should call findByTargetProfileIds from recommendedModulesApi', async function () {
      // given
      const targetProfileIds = Symbol('targetProfileIds');
      const expectedRecommendedModules = Symbol('expectedRecommendedModules');

      const recommendedModulesApiStub = {
        findByTargetProfileIds: sinon.stub(),
      };
      recommendedModulesApiStub.findByTargetProfileIds
        .withArgs({ targetProfileIds })
        .resolves([expectedRecommendedModules]);

      // when
      const result = await recommendedModuleRepository.findIdsByTargetProfileIds({
        targetProfileIds,
        recommendedModulesApi: recommendedModulesApiStub,
      });

      // then
      expect(recommendedModulesApiStub.findByTargetProfileIds).to.be.called;
      expect(result[0]).to.be.an.instanceOf(RecommendedModule);
    });
  });

  describe('#findByCampaignParticipationIds', function () {
    it('should call findByCampaignParticipationIds from recommendedModulesApi', async function () {
      // given
      const campaignParticipationIds = Symbol('campaignParticipationIds');
      const expectedUserRecommendedModules = Symbol('expectedUserRecommendedModules');

      const recommendedModulesApiStub = {
        findByCampaignParticipationIds: sinon.stub(),
      };
      recommendedModulesApiStub.findByCampaignParticipationIds
        .withArgs({ campaignParticipationIds })
        .resolves([expectedUserRecommendedModules]);

      // when
      const result = await recommendedModuleRepository.findIdsByCampaignParticipationIds({
        campaignParticipationIds,
        recommendedModulesApi: recommendedModulesApiStub,
      });

      // then
      expect(recommendedModulesApiStub.findByCampaignParticipationIds).to.be.called;
      expect(result[0]).to.be.an.instanceOf(RecommendedModule);
    });
  });
});
