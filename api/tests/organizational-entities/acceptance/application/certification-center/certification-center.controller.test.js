import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Acceptance | API | Certification Center', function () {
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

      it('should return a list of certificationCenter, with their name and id', async function () {
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

      it('should return 403 HTTP status code ', async function () {
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
});
