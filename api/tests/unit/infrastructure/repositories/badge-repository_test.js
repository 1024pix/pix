const { expect, sinon } = require('../../../test-helper');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');

describe('Unit | Repository | Badge', function() {

  describe('#findOneByTargetProfileId', () => {

    const targetProfileId = 1;

    beforeEach(() => {
      sinon.stub(badgeRepository, 'findOneByTargetProfileId')
        .withArgs(targetProfileId)
        .resolves('ok');
    });

    it('should find the badge associated to the target profile id', async () => {
      // when
      const result = await badgeRepository.findOneByTargetProfileId(targetProfileId);

      // then
      expect(result).to.equal('ok');
    });

  });

});
