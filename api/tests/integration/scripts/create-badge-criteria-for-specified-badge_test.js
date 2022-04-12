const { expect, catchErr, databaseBuilder } = require('../../test-helper');
const { checkBadgeExistence } = require('../../../scripts/create-badge-criteria-for-specified-badge.js');

describe.only('Integration | Scripts | create-badge-criteria-for-specified-badge', function () {
  describe('#checkBadgeExistence', function () {
    it('should throw an error if the badge does not exist', async function () {
      // given
      const badgeId = 123;

      // when
      const error = await catchErr(checkBadgeExistence)(badgeId);

      // then
      expect(error).to.be.an.instanceof(Error);
      expect(error.message).to.equal(`Badge ${badgeId} not found`);
    });

    it('should not throw an error if the badge exists', async function () {
      // given
      const badge = databaseBuilder.factory.buildBadge();
      await databaseBuilder.commit();

      // when
      expect(await checkBadgeExistence(badge.id)).not.to.throw;
    });
  });
});
