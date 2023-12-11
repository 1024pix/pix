import {
  databaseBuilder,
  expect,
  knex,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';

import { CertificationCenterInvitation } from '../../../../lib/domain/models/CertificationCenterInvitation.js';
import { createServer } from '../../../../server.js';

const CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME = 'certification-center-invitations';

describe('Acceptance | API | Certification center invitations', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  context('global routes', function () {
    describe('POST /api/certification-center-invitations/{id}/accept', function () {
      it('it should return an HTTP code 204', async function () {
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

    describe('GET /api/certification-center-invitations/{id}', function () {
      it('should return the certification-center invitation and 200 status code', async function () {
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

    describe('DELETE /api/certification-center-invitations/{id}', function () {
      context('when user is an admin', function () {
        let adminUser, certificationCenter;

        beforeEach(async function () {
          adminUser = databaseBuilder.factory.buildUser();
          certificationCenter = databaseBuilder.factory.buildCertificationCenter();
          databaseBuilder.factory.buildCertificationCenterMembership({
            userId: adminUser.id,
            certificationCenterId: certificationCenter.id,
            role: 'ADMIN',
          });

          await databaseBuilder.commit();
        });

        it('cancels the certification center invitation and returns a 204 HTTP status code', async function () {
          // given
          const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
            certificationCenterId: certificationCenter.id,
          });
          const request = {
            headers: {
              authorization: generateValidRequestAuthorizationHeader(adminUser.id),
            },
            method: 'DELETE',
            url: `/api/certification-center-invitations/${certificationCenterInvitation.id}`,
          };

          await databaseBuilder.commit();

          // when
          const { statusCode } = await server.inject(request);

          // then
          const cancelledCertificationCenterInvitation = await knex(CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME)
            .where({ id: certificationCenterInvitation.id })
            .first();
          expect(cancelledCertificationCenterInvitation.status).to.equal('cancelled');
          expect(statusCode).to.equal(204);
        });
      });
    });

    describe(`PATCH /api/certification-center-invitations/{id}`, function () {
      context('when user is admin of the certification center', function () {
        let adminUser;
        let certificationCenter;

        beforeEach(async function () {
          adminUser = databaseBuilder.factory.buildUser();
          certificationCenter = databaseBuilder.factory.buildCertificationCenter();
          databaseBuilder.factory.buildCertificationCenterMembership({
            userId: adminUser.id,
            certificationCenterId: certificationCenter.id,
            role: 'ADMIN',
          });

          await databaseBuilder.commit();
        });

        it('returns a 200 HTTP status code with updated certification center invitation', async function () {
          // given
          const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
            certificationCenterId: certificationCenter.id,
          });

          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'PATCH',
            url: `/api/certification-center-invitations/${certificationCenterInvitation.id}`,
            headers: {
              authorization: generateValidRequestAuthorizationHeader(adminUser.id),
            },
          });

          // then
          const updatedCertificationCenterInvitation = await knex(CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME)
            .where({ id: certificationCenterInvitation.id })
            .first();

          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal({
            data: {
              type: 'certification-center-invitations',
              id: `${updatedCertificationCenterInvitation.id}`,
              attributes: {
                email: updatedCertificationCenterInvitation.email,
                role: updatedCertificationCenterInvitation.role,
                'updated-at': updatedCertificationCenterInvitation.updatedAt,
              },
            },
          });
        });
      });

      context('when user is not admin of the certification center', function () {
        let user;
        let certificationCenter;

        beforeEach(async function () {
          user = databaseBuilder.factory.buildUser();
          certificationCenter = databaseBuilder.factory.buildCertificationCenter();
          databaseBuilder.factory.buildCertificationCenterMembership({
            userId: user.id,
            certificationCenterId: certificationCenter.id,
            role: 'MEMBER',
          });

          await databaseBuilder.commit();
        });

        it('returns a 403 HTTP status code', async function () {
          // given
          const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
            certificationCenterId: certificationCenter.id,
          });

          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'PATCH',
            url: `/api/certification-center-invitations/${certificationCenterInvitation.id}`,
            headers: {
              authorization: generateValidRequestAuthorizationHeader(user.id),
            },
          });

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  context('admin routes', function () {
    describe('DELETE /api/admin/certification-centers/{id}/invitations/{certificationCenterInvitationId}', function () {
      it('should return 204 HTTP status code', async function () {
        // given
        const adminMember = await insertUserWithRoleSuperAdmin();
        const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
          certificationCenterId: databaseBuilder.factory.buildCertificationCenter().id,
          status: CertificationCenterInvitation.StatusType.PENDING,
        });

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'DELETE',
          url: `/api/admin/certification-center-invitations/${certificationCenterInvitation.id}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(adminMember.id),
          },
        });

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
