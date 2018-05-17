const { expect } = require('../../../test-helper');
const Score = require('../../../../lib/domain/models/Score');

describe('Unit | Domain | Models | Score', () => {

  describe('#displayedPixScore', function() {

    it('should be 7 if pixScore is 7.98', function() {
      // when
      const score = new Score(7.98);

      // then
      expect(score.displayedPixScore).to.equal(7);
    });

    it('should be 8 if pixScore is 8.02', function() {
      // when
      const score = new Score(8.02);

      // then
      expect(score.displayedPixScore).to.equal(8);
    });
  });

  describe('#obtainedLevel', function() {

    it('should be 0 if pixScore is 7.98', function() {
      // when
      const score = new Score(7.98);

      // then
      expect(score.obtainedLevel).to.equal(0);
    });

    it('should be 1 if pixScore is 8.02', function() {
      // when
      const score = new Score(8.02);

      // then
      expect(score.obtainedLevel).to.equal(1);
    });

    it('should be 5 even if pixScore is 48 (level 6 must not be reachable for the moment)', function() {
      // when
      const score = new Score(48);

      // then
      expect(score.obtainedLevel).to.equal(5);
    });

  });
});
