const Assessment = require('../../../../lib/domain/models/Assessment');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | Assessment', () => {

  describe('#isCompleted', () => {

    it('should return true when its status is completed', () => {
      // given
      const assessment = new Assessment({ status: 'completed' });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.true;
    });

    it('should return false when its status is not completed', () => {
      // given
      const assessment = new Assessment({ status: '' });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.false;
    });

  });
});
