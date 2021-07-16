const {
  expect,
  databaseBuilder,
} = require('../../../../../../tests/test-helper');
const certificationCenterMembershipRepository = require('../../../../infrastructure/repositories/certification-center-membership-repository');

describe('Integration | Repositories | certificationCenterMembership', () => {

  describe('#exists', () => {

    context('when the referent is not member of the certification center', () => {

      it('returns false', async () => {
        // given
        const referentId = 2;
        const certificationCenterId = 2;

        databaseBuilder.factory.buildUser({
          id: referentId,
        });

        databaseBuilder.factory.buildCertificationCenter({
          id: certificationCenterId,
        });

        databaseBuilder.factory.buildCertificationCenterMembership({
          id: 1,
          userId: referentId,
          certificationCenterId,
        });

        await databaseBuilder.commit();

        // when
        const result = await certificationCenterMembershipRepository.exists({
          referentId: 12,
          certificationCenterId,
        });

        // then
        expect(result).to.be.false;
      });
    });

    context('when the referent is a member of the certification center', () => {

      it('returns true', async () => {
        // given
        const referentId = 2;
        const certificationCenterId = 2;

        databaseBuilder.factory.buildUser({
          id: referentId,
        });

        databaseBuilder.factory.buildCertificationCenter({
          id: certificationCenterId,
        });

        databaseBuilder.factory.buildCertificationCenterMembership({
          id: 1,
          userId: referentId,
          certificationCenterId,
        });

        await databaseBuilder.commit();

        // when
        const result = await certificationCenterMembershipRepository.exists({
          referentId,
          certificationCenterId,
        });

        // then
        expect(result).to.be.true;
      });
    });
  });
});
