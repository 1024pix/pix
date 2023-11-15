import lodash from 'lodash';

const { omit } = lodash;

import { expect, databaseBuilder, catchErr, sinon, knex } from '../../../test-helper.js';
import * as certificationCenterInvitedUserRepository from '../../../../lib/infrastructure/repositories/certification-center-invited-user-repository.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { CertificationCenterInvitation } from '../../../../lib/domain/models/CertificationCenterInvitation.js';
import { CertificationCenterInvitedUser } from '../../../../lib/domain/models/CertificationCenterInvitedUser.js';

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
        role: CertificationCenterInvitation.Roles.MEMBER,
      };

      // when
      const certificationCenterInvitedUser = await certificationCenterInvitedUserRepository.get({
        certificationCenterInvitationId: certificationCenterInvitation.id,
        email: user.email,
      });

      // then
      const invitation = omit(certificationCenterInvitation, ['email', 'updatedAt', 'createdAt']);
      expect(certificationCenterInvitedUser.invitation).to.deep.equal(expectedCertificationCenterInvitation);
      expect(certificationCenterInvitedUser).to.deepEqualInstance(
        new CertificationCenterInvitedUser({
          userId: user.id,
          invitation,
          status: certificationCenterInvitation.status,
          role: CertificationCenterInvitation.Roles.MEMBER,
        }),
      );
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
        expect(error.message).to.equal(
          'No user found for email inexistantUser@email.net for this certification center invitation',
        );
      });
    });
  });

  describe('#save', function () {
    let clock;

    it('should create membership', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ id: 123 }).id;
      const user = databaseBuilder.factory.buildUser({ id: 6789, email: 'user@example.net' });
      const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        id: 345,
        email: user.email,
        certificationCenterId,
        code: 'ABCDE123',
        status: CertificationCenterInvitation.StatusType.PENDING,
      });
      const certificationCenterInvitedUser = new CertificationCenterInvitedUser({
        userId: user.id,
        invitation: certificationCenterInvitation,
        status: CertificationCenterInvitation.StatusType.ACCEPTED,
      });

      await databaseBuilder.commit();

      // when
      await certificationCenterInvitedUserRepository.save(certificationCenterInvitedUser);

      // then
      const membershipCreated = await knex('certification-center-memberships').where({ userId: 6789 }).first();

      expect(membershipCreated.userId).to.equal(6789);
      expect(membershipCreated.certificationCenterId).to.equal(certificationCenterId);
    });

    it('should mark certification center invitation as accepted', async function () {
      // given
      const now = new Date('2021-05-27');
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ id: 123 }).id;
      const user = databaseBuilder.factory.buildUser({ id: 6789, email: 'user@example.net' });
      const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        id: 345,
        email: user.email,
        certificationCenterId,
        code: 'ABCDE123',
        status: CertificationCenterInvitation.StatusType.PENDING,
        role: CertificationCenterInvitation.Roles.ADMIN,
      });
      const certificationCenterInvitedUser = new CertificationCenterInvitedUser({
        userId: user.id,
        invitation: certificationCenterInvitation,
        status: CertificationCenterInvitation.StatusType.ACCEPTED,
        role: CertificationCenterInvitation.Roles.ADMIN,
      });

      await databaseBuilder.commit();

      // when
      await certificationCenterInvitedUserRepository.save(certificationCenterInvitedUser);

      // then
      const certificationCenterInvitationUpdated = await knex('certification-center-invitations')
        .where({ id: 345 })
        .first();

      expect(certificationCenterInvitationUpdated.status).to.equal(CertificationCenterInvitation.StatusType.ACCEPTED);
      expect(certificationCenterInvitationUpdated.role).to.equal(CertificationCenterInvitation.Roles.ADMIN);
      expect(certificationCenterInvitationUpdated.updatedAt).to.deep.equal(now);
      clock.restore();
    });
  });
});
