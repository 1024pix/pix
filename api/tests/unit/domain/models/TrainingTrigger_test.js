const { expect, domainBuilder, catchErr } = require('../../../test-helper');
const TrainingTrigger = require('../../../../lib/domain/models/TrainingTrigger');

describe('Unit | Domain | Models | TrainingTrigger', function () {
  describe('#constructor', function () {
    it('should be a valid type', function () {
      // given
      const trainingTrigger = domainBuilder.buildTrainingTrigger({ type: TrainingTrigger.types.PREREQUISITE });

      // then
      expect(trainingTrigger).to.be.instanceOf(TrainingTrigger);
    });

    it('should throw an error when type is not valid', async function () {
      // given
      const error = await catchErr(domainBuilder.buildTrainingTrigger)({ type: 'not_valid_type' });

      expect(error.message).to.equal('Invalid trigger type');
    });

    it('should have all properties', function () {
      // given
      const trainingTrigger = domainBuilder.buildTrainingTrigger({
        id: 1,
        type: TrainingTrigger.types.GOAL,
        trainingId: 100,
        threshold: 10,
      });

      // then
      expect(trainingTrigger.id).to.equal(1);
      expect(trainingTrigger.type).to.equal('goal');
      expect(trainingTrigger.trainingId).to.equal(100);
      expect(trainingTrigger.threshold).to.equal(10);
    });
  });
});
