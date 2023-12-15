import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
  sinon,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';
import { CertificationCenterInvitation } from '../../../../lib/domain/models/CertificationCenterInvitation.js';

describe('Acceptance | Route | Certification Centers', function () {
  let server;
  let clock;
  const now = new Date('2021-05-01');

  beforeEach(async function () {
    clock = sinon.useFakeTimers({
      now,
      toFake: ['Date'],
    });
    server = await createServer();
  });

  afterEach(async function () {
    clock.restore();
  });

  describe('PATCH /api/admin/certification-centers/{id}', function () {
    context('when an admin member updates a certification center information', function () {
      it('it should return an HTTP code 200 with the updated data', async function () {
        // given
        const adminMember = await insertUserWithRoleSuperAdmin();
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();

        await databaseBuilder.commit();

        // when
        const { result, statusCode } = await server.inject({
          headers: {
            authorization: generateValidRequestAuthorizationHeader(adminMember.id),
          },
          method: 'PATCH',
          payload: {
            data: {
              id: certificationCenter.id,
              attributes: {
                'data-protection-officer-first-name': 'Justin',
                'data-protection-officer-last-name': 'Ptipeu',
                'data-protection-officer-email': 'justin.ptipeu@example.net',
                name: 'Justin Ptipeu Orga',
                type: 'PRO',
              },
            },
          },
          url: `/api/admin/certification-centers/${certificationCenter.id}`,
        });

        // then
        expect(statusCode).to.equal(200);
        expect(result.data.attributes['data-protection-officer-first-name']).to.equal('Justin');
        expect(result.data.attributes['data-protection-officer-last-name']).to.equal('Ptipeu');
        expect(result.data.attributes['data-protection-officer-email']).to.equal('justin.ptipeu@example.net');
        expect(result.data.attributes.name).to.equal('Justin Ptipeu Orga');
      });
    });
  });

  describe('POST /api/admin/certification-centers/{certificationCenterId}/invitations', function () {
    it('should return 201 HTTP status code with created invitation', async function () {
      // given
      const adminMember = await insertUserWithRoleSuperAdmin();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      await databaseBuilder.commit();

      // when
      const { result, statusCode } = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminMember.id),
        },
        method: 'POST',
        payload: {
          data: {
            attributes: {
              email: 'some.user@example.net',
              lang: 'fr-fr',
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
      });
    });
  });

  describe('POST /api/certification-centers/{certificationCenterId}/members/me/disable', function () {
    it('disables the connected user certification center membership and returns 204 HTTP status code', async function () {
      // given
      const adminUserId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId,
        userId: adminUserId,
        role: 'ADMIN',
      });
      databaseBuilder.factory.buildCertificationCenterMembership({ certificationCenterId, role: 'ADMIN' });
      await databaseBuilder.commit();

      // when
      const { statusCode } = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUserId),
        },
        method: 'POST',
        url: `/api/admin/certification-centers/${certificationCenterId}/members/me/disable`,
      });

      // then
      const certificationCenterMembership = await knex('certification-center-memberships')
        .where({ certificationCenterId, userId: adminUserId })
        .first();
      expect(statusCode).to.equal(204);
      expect(certificationCenterMembership.disabledAt).to.deep.equal(now);
    });
  });
});
