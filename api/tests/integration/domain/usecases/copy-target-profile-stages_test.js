import { copyTargetProfileStages } from '../../../../lib/domain/usecases/copy-target-profile-stages.js';
import * as stageRepository from '../../../../src/evaluation/infrastructure/repositories/stage-repository.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | UseCases | copy-stages', function () {
  describe('when there are stages to copy from an origin to a destination target profile', function () {
    it('should copy the stages', async function () {
      // given
      const originTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const destinationTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const anotherTargetProfile = databaseBuilder.factory.buildTargetProfile();
      const firstStage = databaseBuilder.factory.buildStage({ targetProfileId: originTargetProfileId });
      const secondStage = databaseBuilder.factory.buildStage({ targetProfileId: originTargetProfileId });
      databaseBuilder.factory.buildStage({ targetProfileId: anotherTargetProfile.id });

      await databaseBuilder.commit();

      // when
      await copyTargetProfileStages({ originTargetProfileId, destinationTargetProfileId, stageRepository });

      // then
      const destinationTargetProfileStages = await knex('stages').where({
        targetProfileId: destinationTargetProfileId,
      });
      expect(destinationTargetProfileStages.length).to.equal(2);
      expect(destinationTargetProfileStages[0].title).to.equal(firstStage.title);
      expect(destinationTargetProfileStages[1].title).to.equal(secondStage.title);
    });
  });
});
