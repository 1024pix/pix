const { expect, sinon } = require('../../../test-helper');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const targetProfileController = require('../../../../lib/application/target-profiles/target-profile-controller');

describe('Unit | Application | TargetProfiles | target-profile-controller', () => {

  describe('#getImageUrl', () => {

    it('should return the serialized image', async () => {
      // given
      const targetProfileId = 123;
      const targetProfileImageUrl = 'someImageUrl';
      const request = {
        params: { id: targetProfileId },
      };
      sinon.stub(targetProfileRepository, 'getImageUrl').withArgs(targetProfileId).resolves(targetProfileImageUrl);

      // when
      const response = await targetProfileController.getImageUrl(request);

      // then
      expect(response.data).to.deep.equal({
        type: 'target-profile-image-urls',
        id: targetProfileId.toString(),
        attributes: {
          'image': targetProfileImageUrl,
        },
      });
    });
  });
});
