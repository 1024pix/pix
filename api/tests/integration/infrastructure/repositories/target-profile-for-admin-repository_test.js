const { expect, databaseBuilder } = require('../../../test-helper');
const targetProfileForAdmin = require('../../../../lib/infrastructure/repositories/target-profile-for-admin-repository');

describe('Integration | Repository | target-profile-for-admin', function () {
  describe('#isNewFormat', function () {
    context('when target profile does not exist', function () {
      it('should return false', async function () {
        // when
        const isNewFormat = await targetProfileForAdmin.isNewFormat(1);

        // then
        expect(isNewFormat).to.be.false;
      });
    });
    context('when target profile is old format', function () {
      it('should return false', async function () {
        // given
        databaseBuilder.factory.buildTargetProfile({ id: 1 });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: 1 });
        await databaseBuilder.commit();

        // when
        const isNewFormat = await targetProfileForAdmin.isNewFormat(1);

        // then
        expect(isNewFormat).to.be.false;
      });
    });
    context('when target profile is new format', function () {
      it('should return true', async function () {
        // given
        databaseBuilder.factory.buildTargetProfile({ id: 1 });
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: 1 });
        await databaseBuilder.commit();

        // when
        const isNewFormat = await targetProfileForAdmin.isNewFormat(1);

        // then
        expect(isNewFormat).to.be.true;
      });
    });
  });
});
