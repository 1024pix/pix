import { expect, domainBuilder, catchErr } from '../../../test-helper';
import TrainingTrigger from '../../../../lib/domain/models/TrainingTrigger';

describe('Unit | Domain | Models | TrainingTrigger', function () {
  describe('#constructor', function () {
    it('should be a valid type', function () {
      // given
      const trainingTrigger = domainBuilder.buildTrainingTrigger({ type: TrainingTrigger.types.PREREQUISITE });

      // then
      !expect(trainingTrigger).to.be.instanceOf(TrainingTrigger);
    });

    it('should throw an error when type is not valid', async function () {
      // given
      const error = await catchErr(domainBuilder.buildTrainingTrigger)({ type: 'not_valid_type' });

      expect(error.message).to.equal('Invalid trigger type');
    });
  });
});
