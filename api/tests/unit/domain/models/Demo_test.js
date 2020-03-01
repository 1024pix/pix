const { expect } = require('../../../test-helper');
const Demo = require('../../../../lib/domain/models/Demo');

describe('Unit | Domain | Models | Demo', () => {

  describe('#nbChallenges', () => {

    it('should return the number of challenges', () => {
      // given
      const challenges = [
        'firstChallenge',
        'secondChallenge',
      ];
      const demo = new Demo({ challenges });

      // when
      const result = demo.nbChallenges;

      // then
      expect(result).to.equal(2);
    });
  });
});
