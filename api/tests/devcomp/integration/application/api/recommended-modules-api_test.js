import nock from 'nock';

import { RecommendableModule } from '../../../../../src/devcomp/application/api/models/RecommendableModule.js';
import { RecommendedModule } from '../../../../../src/devcomp/application/api/models/RecommendedModule.js';
import * as recommendedModulesApi from '../../../../../src/devcomp/application/api/recommended-modules-api.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Devcomp | Application | Api | RecommendedModules', function () {
  describe('#findByCampaignParticipationIds', function () {
    it('should return a list recommended modules', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId }).id;
      const trainingId = databaseBuilder.factory.buildTraining({
        type: 'modulix',
        link: '/modules/adresse-ip-publique-et-vous',
      }).id;
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId,
        campaignParticipationId,
        trainingId,
      });

      await databaseBuilder.commit();

      // when
      const result = await recommendedModulesApi.findByCampaignParticipationIds({
        campaignParticipationIds: [campaignParticipationId],
      });

      // then
      const expectedResult = [
        new RecommendedModule({
          id: trainingId,
          moduleId: '5df14039-803b-4db4-9778-67e4b84afbbd',
          shortId: 'ecc13f55',
        }),
      ];

      expect(result).to.deep.equal(expectedResult);
    });

    context('if campaignParticipationIds is empty', function () {
      it('should throw a DomainError error', async function () {
        // given & when
        const error = await catchErr(recommendedModulesApi.findByCampaignParticipationIds)({
          campaignParticipationIds: [],
        });

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('campaignParticipationIds can not be empty');
      });
    });
  });

  describe('#findByTargetProfileIds', function () {
    it('should return a list recommended modules', async function () {
      // given
      nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const trainingId = databaseBuilder.factory.buildTraining({
        type: 'modulix',
        link: '/modules/adresse-ip-publique-et-vous',
      }).id;
      databaseBuilder.factory.buildTargetProfileTraining({ trainingId, targetProfileId });
      const targetProfileId2 = databaseBuilder.factory.buildTargetProfile().id;
      const trainingId2 = databaseBuilder.factory.buildTraining({
        type: 'modulix',
        link: '/modules/au-dela-des-mots-de-passe',
      }).id;
      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: trainingId2,
        targetProfileId: targetProfileId2,
      });

      await databaseBuilder.commit();

      // when
      const results = await recommendedModulesApi.findByTargetProfileIds({
        targetProfileIds: [targetProfileId, targetProfileId2],
      });

      // then
      const expectedResult = [
        new RecommendableModule({
          id: trainingId,
          moduleId: '5df14039-803b-4db4-9778-67e4b84afbbd',
          shortId: 'ecc13f55',
          targetProfileIds: [targetProfileId],
        }),
        new RecommendableModule({
          id: trainingId2,
          moduleId: '9beb922f-4d8e-495d-9c85-0e7265ca78d6',
          shortId: 'e074af34',
          targetProfileIds: [targetProfileId2],
        }),
      ];

      expect(results[0]).to.be.an.instanceOf(RecommendableModule);
      expect(results[0].targetProfileIds[0]).to.deep.equal(expectedResult[0].targetProfileIds[0]);
      expect(results[0].moduleId).to.deep.equal(expectedResult[0].moduleId);
      expect(results[0].id).to.deep.equal(expectedResult[0].id);
      expect(results[1]).to.be.an.instanceOf(RecommendableModule);
      expect(results[1].targetProfileIds[0]).to.deep.equal(expectedResult[1].targetProfileIds[0]);
      expect(results[1].moduleId).to.deep.equal(expectedResult[1].moduleId);
      expect(results[1].id).to.deep.equal(expectedResult[1].id);
    });

    context('if targetProfileIds is empty', function () {
      it('should throw a DomainError error', async function () {
        // given & when
        const error = await catchErr(recommendedModulesApi.findByTargetProfileIds)({
          targetProfileIds: [],
        });

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('targetProfileIds can not be empty');
      });
    });
  });
});
