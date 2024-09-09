import { CertificationCenterInvitation } from '../../../../../src/team/domain/models/CertificationCenterInvitation.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
} from '../../../../test-helper.js';

const CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME = 'certification-center-invitations';

describe('Acceptance | Team | Application | Route | Certification Center Invitation', function () {
  let server, request;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/certification-centers/{id}/invitations', function () {
    let certificationCenterId, userId;
    const CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME = 'certification-center-invitations';

    beforeEach(async function () {
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();
    });

    context('When user is not admin of the certification center', function () {
      it('returns an 403 HTTP error code', async function () {
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, role: 'MEMBER' });

        await databaseBuilder.commit();

        request = {
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          method: 'POST',
          url: `/api/certification-centers/${certificationCenterId}/invitations`,
          payload: {},
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('When user is admin of the certification center', function () {
      it('returns 204 HTTP status code', async function () {
        const emails = ['dev@example.net', 'com@example.net'];
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, role: 'ADMIN' });

        await databaseBuilder.commit();

        request = {
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          method: 'POST',
          url: `/api/certification-centers/${certificationCenterId}/invitations`,
          payload: {
            data: {
              attributes: {
                emails,
              },
            },
          },
        };

        // when
        const response = await server.inject(request);

        // then
        const certificationCenterInvitations = await knex(CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME)
          .where({ certificationCenterId })
          .whereIn('email', emails);
        expect(response.statusCode).to.equal(204);
        expect(certificationCenterInvitations.length).to.equal(2);
      });
    });
  });

  describe('GET /api/certifications-centers/{certificationCenterId}/invitations', function () {
    let certificationCenterId, userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    });

    context('When user is admin of the certification center', function () {
      it('returns pending invitations from certification center', async function () {
        // given
        const invitation = databaseBuilder.factory.buildCertificationCenterInvitation({ certificationCenterId });
        const invitation2 = databaseBuilder.factory.buildCertificationCenterInvitation({
          certificationCenterId,
          code: 'WXCVBN',
          email: 'test@example.net',
        });
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, role: 'ADMIN' });

        await databaseBuilder.commit();

        request = {
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          method: 'GET',
          url: `/api/certification-centers/${certificationCenterId}/invitations`,
          payload: { certificationCenterId },
        };

        // when
        const response = await server.inject(request);
        const responseIds = response.result.data.map(
          (certificationCenterInvitation) => certificationCenterInvitation.id,
        );

        // then
        expect(response.statusCode).to.equal(200);
        expect(responseIds).to.have.members([invitation.id.toString(), invitation2.id.toString()]);
      });
    });

    context('When user is not admin of the certification center', function () {
      it('returns an 403 HTTP error code', async function () {
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, role: 'MEMBER' });

        await databaseBuilder.commit();

        request = {
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          method: 'GET',
          url: `/api/certification-centers/${certificationCenterId}/invitations`,
          payload: { certificationCenterId },
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/certification-center-invitations/{id}', function () {
    it('returns the certification-center invitation and 200 status code', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        name: 'Centre des Pixous',
      }).id;
      const certificationCenterInvitationId = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId,
        status: CertificationCenterInvitation.StatusType.PENDING,
        code: 'ABCDEFGH01',
      }).id;

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/certification-center-invitations/${certificationCenterInvitationId}?code=ABCDEFGH01`,
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'certification-center-invitations',
          id: certificationCenterInvitationId.toString(),
          attributes: {
            'certification-center-id': certificationCenterId,
            'certification-center-name': 'Centre des Pixous',
            status: CertificationCenterInvitation.StatusType.PENDING,
          },
        },
      });
    });
  });

  describe('POST /api/certification-center-invitations/{id}/accept', function () {
    it('it returns an HTTP code 204', async function () {
      // given
      databaseBuilder.factory.buildUser({ id: 293, email: 'user@example.net' });
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        id: 123,
        code: 'AZERT123',
        certificationCenterId: certificationCenter.id,
        status: CertificationCenterInvitation.StatusType.PENDING,
      });

      await databaseBuilder.commit();

      // when
      const result = await server.inject({
        headers: {
          authorization: false,
        },
        method: 'POST',
        url: `/api/certification-center-invitations/${certificationCenterInvitation.id}/accept`,
        payload: {
          data: {
            id: '123_AZERT123',
            type: 'certification-center-invitations-responses',
            attributes: {
              code: 'AZERT123',
              email: 'user@example.net',
            },
          },
        },
      });

      // then
      expect(result.statusCode).to.equal(204);

      const membership = await knex('certification-center-memberships')
        .select('userId')
        .where({ certificationCenterId: certificationCenter.id })
        .first();
      const invitation = await knex('certification-center-invitations')
        .select('status')
        .where({ certificationCenterId: certificationCenter.id })
        .first();

      expect(membership.userId).to.equal(293);
      expect(invitation.status).to.equal(CertificationCenterInvitation.StatusType.ACCEPTED);
    });
  });

  describe('DELETE /api/certification-center-invitations/{id}', function () {
    let certificationCenter, certificationCenterInvitation, request, user;

    beforeEach(async function () {
      certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: certificationCenter.id,
      });
      user = databaseBuilder.factory.buildUser();

      await databaseBuilder.commit();

      request = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
        },
        method: 'DELETE',
        url: `/api/certification-center-invitations/${certificationCenterInvitation.id}`,
      };
    });

    context('when user is an admin of the certification center', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId: user.id,
          certificationCenterId: certificationCenter.id,
          role: 'ADMIN',
        });
        await databaseBuilder.commit();
      });

      it('cancels the certification center invitation and returns a 204 HTTP status code', async function () {
        // when
        const { statusCode } = await server.inject(request);

        // then
        const cancelledCertificationCenterInvitation = await knex(CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME)
          .where({ id: certificationCenterInvitation.id })
          .first();

        expect(statusCode).to.equal(204);
        expect(cancelledCertificationCenterInvitation.status).to.equal('cancelled');
      });
    });

    context('when user is not an admin of the certification center', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId: user.id,
          certificationCenterId: certificationCenter.id,
          role: 'MEMBER',
        });
        await databaseBuilder.commit();
      });

      it('returns a 403 HTTP status code and the certification center invitation is not cancelled', async function () {
        // when
        const { statusCode } = await server.inject(request);

        // then
        const cancelledCertificationCenterInvitation = await knex(CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME)
          .where({ id: certificationCenterInvitation.id })
          .first();

        expect(statusCode).to.equal(403);
        expect(cancelledCertificationCenterInvitation.status).to.equal('pending');
      });
    });
  });
});
