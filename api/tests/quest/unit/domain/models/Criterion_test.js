import { Criterion } from '../../../../../src/quest/domain/models/Criterion.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Criterion ', function () {
  describe('#toDTO', function () {
    it('should return a DTO version of the criterion', function () {
      // given
      const criterion = new Criterion({
        data: { some: 'awesome', cool: 'stuff' },
      });

      // when
      const DTO = criterion.toDTO();

      // then
      expect(DTO).to.deep.equal({ some: 'awesome', cool: 'stuff' });
    });
  });
});
