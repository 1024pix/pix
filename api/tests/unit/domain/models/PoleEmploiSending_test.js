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

    it('should set responseCode', () => {
      // given
      const responseCode = '200';
      const poleEmploiSending = domainBuilder.buildPoleEmploiSending();

      // when
      poleEmploiSending.succeed(responseCode);

      // then
      expect(poleEmploiSending.responseCode).to.equal(responseCode);
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

    it('should set responseCode', () => {
      // given
      const responseCode = '400';
      const poleEmploiSending = domainBuilder.buildPoleEmploiSending();

      // when
      poleEmploiSending.fail(responseCode);

      // then
      expect(poleEmploiSending.responseCode).to.equal(responseCode);
    });
  });
});
