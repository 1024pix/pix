import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Acceptance | Organization Entities | Route | Certification Centers', function () {
  let server, request;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('GET /api/admin/certification-centers', function () {
    beforeEach(async function () {
      request = {
        method: 'GET',
        url: '/api/admin/certification-centers',
      };
    });

    context('when user is Super Admin', function () {
      beforeEach(function () {
        request.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('returns a list of certificationCenter, with their name and id', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'Centres des tests jolis',
          type: 'SUP',
          externalId: '12345',
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 2,
          name: 'Centres des tests pas moches',
          type: 'SCO',
          externalId: '222',
          createdAt: new Date('2020-01-05'),
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 12,
          label: 'Pix+Edu 1er degré',
          key: 'EDU_1ER_DEGRE',
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: 1,
          complementaryCertificationId: 12,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              id: '1',
              type: 'certification-centers',
              attributes: {
                'created-at': new Date('2020-01-01'),
                'external-id': '12345',
                name: 'Centres des tests jolis',
                type: 'SUP',
              },
              relationships: {
                habilitations: {
                  data: [
                    {
                      id: '12',
                      type: 'complementary-certifications',
                    },
                  ],
                },
                'certification-center-memberships': {
                  links: {
                    related: '/api/certification-centers/1/certification-center-memberships',
                  },
                },
              },
            },
            {
              id: '2',
              type: 'certification-centers',
              attributes: {
                'created-at': new Date('2020-01-05'),
                'external-id': '222',
                name: 'Centres des tests pas moches',
                type: 'SCO',
              },
              relationships: {
                habilitations: {
                  data: [],
                },
                'certification-center-memberships': {
                  links: {
                    related: '/api/certification-centers/2/certification-center-memberships',
                  },
                },
              },
            },
          ],
          included: [
            {
              id: '12',
              type: 'complementary-certifications',
              attributes: {
                label: 'Pix+Edu 1er degré',
                key: 'EDU_1ER_DEGRE',
              },
            },
          ],
          meta: {
            page: 1,
            pageCount: 1,
            pageSize: 10,
            rowCount: 2,
          },
        });
      });
    });

    context('when user is not SuperAdmin', function () {
      beforeEach(function () {
        request.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('returns a 403 HTTP status code ', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', function () {
      it('should return 401 HTTP status code if user is not authenticated', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('POST /api/admin/certification-centers', function () {
    let complementaryCertification;

    beforeEach(async function () {
      // given
      complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      await databaseBuilder.commit();
    });

    afterEach(async function () {
      complementaryCertification = null;
    });

    context('when user is Super Admin', function () {
      it('returns 200 HTTP status with the certification center created', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/admin/certification-centers',
          headers: { authorization: generateValidRequestAuthorizationHeader() },
          payload: {
            data: {
              type: 'certification-center',
              attributes: {
                name: 'Nouveau Centre de Certif',
                type: 'SCO',
                'data-protection-officer-email': 'adrienne.quepourra@example.net',
                'is-v3-pilot': true,
              },
              relationships: {
                habilitations: {
                  data: [
                    {
                      type: 'complementary-certifications',
                      id: `${complementaryCertification.id}`,
                    },
                  ],
                },
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes.name).to.equal('Nouveau Centre de Certif');
        expect(response.result.data.attributes['data-protection-officer-email']).to.equal(
          'adrienne.quepourra@example.net',
        );
        expect(response.result.data.attributes['is-v3-pilot']).to.equal(true);
        expect(response.result.data.id).to.be.ok;
      });
    });

    context('when user is not SuperAdmin', function () {
      it('should return 403 HTTP status code ', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/admin/certification-centers',
          headers: { authorization: generateValidRequestAuthorizationHeader(111) },
          payload: {
            data: {
              type: 'certification-center',
              attributes: {
                name: 'Nouveau Centre de Certif',
                type: 'SCO',
              },
              relationships: {
                habilitations: {
                  data: [
                    {
                      type: 'complementary-certifications',
                      id: `${complementaryCertification.id}`,
                    },
                  ],
                },
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
