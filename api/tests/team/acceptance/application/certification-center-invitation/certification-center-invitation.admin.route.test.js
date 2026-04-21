import sinon from 'sinon';

import { createServer } from '../../../../../server.js';
import { CertificationCenterInvitation } from '../../../../../src/team/domain/models/CertificationCenterInvitation.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Team | Application | Route | Admin | Certification Center Invitation', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/certification-centers/{certificationCenterId}/invitations', function () {
    it('should return 200 HTTP status code and the list of invitations', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const now = new Date();
      const certificationCenterInvitation1 = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId,
        status: CertificationCenterInvitation.StatusType.PENDING,
        email: 'alex.terieur@example.net',
        role: 'MEMBER',
        updatedAt: now,
      });
      const certificationCenterInvitation2 = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId,
        status: CertificationCenterInvitation.StatusType.PENDING,
        email: 'sarah.pelle@example.net',
        role: 'ADMIN',
        updatedAt: now,
      });
      databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId,
        status: CertificationCenterInvitation.StatusType.ACCEPTED,
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/certification-centers/${certificationCenterId}/invitations`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(2);
      expect(response.result.data).to.deep.have.members([
        {
          type: 'certification-center-invitations',
          id: certificationCenterInvitation1.id.toString(),
          attributes: {
            email: 'alex.terieur@example.net',
            role: 'MEMBER',
            locale: 'fr',
            'updated-at': now,
          },
        },
        {
          type: 'certification-center-invitations',
          id: certificationCenterInvitation2.id.toString(),
          attributes: {
            email: 'sarah.pelle@example.net',
            role: 'ADMIN',
            locale: 'fr',
            'updated-at': now,
          },
        },
      ]);
    });
  });

  describe('POST /api/admin/certification-centers/{certificationCenterId}/invitations', function () {
    let clock;
    const now = new Date('2021-05-01');

    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now,
        toFake: ['Date'],
      });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('returns 201 HTTP status code with created invitation', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      await databaseBuilder.commit();

      // when
      const { result, statusCode } = await server.inject({
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        method: 'POST',
        payload: {
          data: {
            attributes: {
              email: 'some.user@example.net',
              locale: 'fr-FR',
              role: CertificationCenterInvitation.Roles.ADMIN,
            },
          },
        },
        url: `/api/admin/certification-centers/${certificationCenterId}/invitations`,
      });

      // then
      expect(statusCode).to.equal(201);
      expect(result.data.type).to.equal('certification-center-invitations');
      expect(result.data).to.have.property('id');
      expect(result.data.attributes).to.deep.equal({
        'updated-at': now,
        email: 'some.user@example.net',
        role: 'ADMIN',
        locale: 'fr-FR',
      });
    });
  });

  describe('DELETE /api/admin/certification-centers/{id}/invitations/{certificationCenterInvitationId}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: databaseBuilder.factory.buildCertificationCenter().id,
        status: CertificationCenterInvitation.StatusType.PENDING,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'DELETE',
        url: `/api/admin/certification-center-invitations/${certificationCenterInvitation.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
