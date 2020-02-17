const { expect, sinon } = require('../../../test-helper');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');

describe('Unit | Repository | Badge', function() {

  describe('#getByTargetProfileId', () => {

    const targetProfileId = 1;

    beforeEach(() => {
      sinon.stub(badgeRepository, 'getByTargetProfileId')
        .withArgs(targetProfileId)
        .resolves('ok');
    });

    it('should get the badge associated to the target profile id', async () => {
      // when
      const result = await badgeRepository.getByTargetProfileId(targetProfileId);

      // then
      expect(result).to.equal('ok');
    });

  });

});
