import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
  sinon,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';

describe('Acceptance | Route | Certification Centers', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  afterEach(async function () {
    await knex('complementary-certification-habilitations').delete();
    await knex('data-protection-officers').delete();
    await knex('certification-center-invitations').delete();
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
              role: 'ADMIN',
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
});
