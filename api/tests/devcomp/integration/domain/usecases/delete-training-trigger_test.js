import { usecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Devcomp | Domain | UseCases | deleteTrainingTrigger', function () {
  context('when deleting a training trigger', function () {
    it('should successfully delete the training trigger and its associated tubes', async function () {
      // given
      const { id: trainingId } = databaseBuilder.factory.buildTraining();
      const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger({
        trainingId,
        type: 'prerequisite',
        threshold: 50,
      });

      databaseBuilder.factory.buildTrainingTriggerTube({
        trainingTriggerId: trainingTrigger.id,
        tubeId: 'rec0',
        level: 1,
      });
      databaseBuilder.factory.buildTrainingTriggerTube({
        trainingTriggerId: trainingTrigger.id,
        tubeId: 'rec1',
        level: 2,
      });

      await databaseBuilder.commit();

      // when
      const result = await usecases.deleteTrainingTrigger({
        trainingTriggerId: trainingTrigger.id,
        trainingId,
      });

      // then
      const remainingTriggers = await databaseBuilder.knex('training-triggers').where({ id: trainingTrigger.id });
      const remainingTubes = await databaseBuilder
        .knex('training-trigger-tubes')
        .where({ trainingTriggerId: trainingTrigger.id });

      expect(remainingTriggers).to.have.lengthOf(0);
      expect(remainingTubes).to.have.lengthOf(0);
      expect(result).to.be.undefined;
    });
  });

  context('when trying to delete a non-existent training trigger', function () {
    it('should throw an error', async function () {
      // given
      const { id: trainingId } = databaseBuilder.factory.buildTraining();
      const nonExistentTriggerId = 12;

      // when
      const error = await catchErr(usecases.deleteTrainingTrigger)({
        trainingTriggerId: nonExistentTriggerId,
        trainingId,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`The training trigger 12 is not related to the training ${trainingId}`);
    });
  });
});
