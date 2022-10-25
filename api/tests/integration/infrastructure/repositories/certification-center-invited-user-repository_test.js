const { expect, databaseBuilder, catchErr } = require('../../../test-helper');
const certificationCenterInvitedUserRepository = require('../../../../lib/infrastructure/repositories/certification-center-invited-user-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');
const CertificationCenterInvitation = require('../../../../lib/domain/models/CertificationCenterInvitation');

describe('Integration | Repository | CertificationCenterInvitedUserRepository', function () {
  describe('#get', function () {
    it('should return the invitation of the invited user', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ id: 123 }).id;
      const user = databaseBuilder.factory.buildUser({ email: 'user@example.net' });
      const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        id: 345,
        email: user.email,
        certificationCenterId,
        code: 'ABCDE123',
        status: CertificationCenterInvitation.StatusType.PENDING,
      });
      databaseBuilder.factory.buildCertificationCenterInvitation({
        id: 890,
        email: 'anotherUser@example.net',
        certificationCenterId,
        code: 'DFGHJ123',
        status: CertificationCenterInvitation.StatusType.PENDING,
      });
      await databaseBuilder.commit();

      const expectedCertificationCenterInvitation = {
        id: 345,
        certificationCenterId: 123,
        code: 'ABCDE123',
        status: 'pending',
      };

      // when
      const result = await certificationCenterInvitedUserRepository.get({
        certificationCenterInvitationId: certificationCenterInvitation.id,
        email: user.email,
      });

      // then
      expect(result.invitation).to.deep.equal(expectedCertificationCenterInvitation);
    });

    context('when there are no invitation with the certificationCenterInvitationId', function () {
      it('should throw an error', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ id: 123 }).id;
        databaseBuilder.factory.buildCertificationCenterInvitation({
          id: 890,
          email: 'anotherUser@example.net',
          certificationCenterId,
          code: 'DFGHJ123',
          status: CertificationCenterInvitation.StatusType.PENDING,
        });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(certificationCenterInvitedUserRepository.get)({
          certificationCenterInvitationId: 3256,
        });

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
        expect(error.message).to.equal('No certification center invitation found for ID 3256');
      });
    });

    context('when there are no user with the given email', function () {
      it('should throw an error', async function () {
        // given
        const certificationCenterInvitationId = databaseBuilder.factory.buildCertificationCenterInvitation({
          id: 123,
        }).id;
        await databaseBuilder.commit();

        // when
        const error = await catchErr(certificationCenterInvitedUserRepository.get)({
          certificationCenterInvitationId,
          email: 'inexistantUser@email.net',
        });

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
        expect(error.message).to.equal('No user found for email inexistantUser@email.net');
      });
    });
  });
});
