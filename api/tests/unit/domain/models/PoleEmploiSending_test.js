const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | PoleEmploiSending', () => {

  describe('#succeed', () => {
    it('should set isSuccessful to true', () => {
      // given
      const poleEmploiSending = domainBuilder.buildPoleEmploiSending();

      // when
      poleEmploiSending.succeed();

      // then
      expect(poleEmploiSending.isSuccessful).to.equal(true);
    });
  });

  describe('#fail', () => {
    it('should set isSuccessful to false', () => {
      // given
      const poleEmploiSending = domainBuilder.buildPoleEmploiSending();

      // when
      poleEmploiSending.fail();

      // then
      expect(poleEmploiSending.isSuccessful).to.equal(false);
    });
  });
});
