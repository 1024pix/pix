import { createServer } from '../../../../../server.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Organization Entities | Admin | Route | Certification Centers', function () {
  let superAdmin, request, server;

  beforeEach(async function () {
    server = await createServer();
    superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
    await databaseBuilder.commit();
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
        request.headers = generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id });
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
                  data: [],
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
        request.headers = generateAuthenticatedUserRequestHeaders({ userId: 1111 });
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
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
          payload: {
            data: {
              type: 'certification-center',
              attributes: {
                name: 'Nouveau Centre de Certif',
                type: 'SCO',
                'data-protection-officer-email': 'adrienne.quepourra@example.net',
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
        expect(response.result.data.id).to.be.ok;
      });
    });

    context('when user is not SuperAdmin', function () {
      it('should return 403 HTTP status code ', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/admin/certification-centers',
          headers: generateAuthenticatedUserRequestHeaders({ userId: 111 }),
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

  describe('GET /api/admin/certification-centers/{id}', function () {
    let expectedCertificationCenter;

    beforeEach(async function () {
      expectedCertificationCenter = databaseBuilder.factory.buildCertificationCenter({
        id: 1234,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildComplementaryCertification({
        id: 4567,
        key: 'certif comp',
        label: 'Une Certif Comp',
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: 1234,
        complementaryCertificationId: 4567,
      });
      databaseBuilder.factory.buildCertificationCenter({});
      await databaseBuilder.commit();
      request = {
        method: 'GET',
        url: '/api/admin/certification-centers/' + expectedCertificationCenter.id,
      };
    });

    context('when user is Super Admin', function () {
      beforeEach(function () {
        request.headers = generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id });
      });

      it('returns 200 HTTP status', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('returns the certification center asked', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.result).to.deep.equal({
          data: {
            type: 'certification-centers',
            id: '1234',
            attributes: {
              name: 'some name',
              type: 'SUP',
              'external-id': 'EX123',
              'created-at': new Date('2020-01-01'),
              'archived-at': null,
              'archivist-full-name': null,
              'data-protection-officer-first-name': undefined,
              'data-protection-officer-last-name': undefined,
              'data-protection-officer-email': undefined,
            },
            relationships: {
              'certification-center-invitations': {
                links: {
                  related: '/api/admin/certification-centers/1234/invitations',
                },
              },
              'certification-center-memberships': {
                links: {
                  related: '/api/admin/certification-centers/1234/certification-center-memberships',
                },
              },
              habilitations: {
                data: [
                  {
                    id: '4567',
                    type: 'complementary-certifications',
                  },
                ],
              },
            },
          },
          included: [
            {
              id: '4567',
              type: 'complementary-certifications',
              attributes: { key: 'certif comp', label: 'Une Certif Comp' },
            },
          ],
        });
      });

      it('returns notFoundError when the certificationCenter not exist', async function () {
        // given
        request.url = '/api/admin/certification-centers/112334';

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.result.errors[0].title).to.equal('Not Found');
        expect(response.result.errors[0].detail).to.equal('Center not found');
      });
    });

    context('when user is not SuperAdmin', function () {
      beforeEach(function () {
        request.headers = generateAuthenticatedUserRequestHeaders({ userId: 1111 });
      });

      it('returns 403 HTTP status code ', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', function () {
      it('returns 401 HTTP status code if user is not authenticated', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('PATCH /api/admin/certification-centers/{id}', function () {
    context('when an admin member updates a certification center information', function () {
      it('returns an HTTP code 200 with the updated data', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();

        await databaseBuilder.commit();

        // when
        const { result, statusCode } = await server.inject({
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
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

  describe('POST /api/admin/certification-centers/{certificationCenterId}/archive', function () {
    it('archives the certification center and related data and returns 204', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const previousUpdate = new Date(2022, 4, 5);
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId,
        statusCode: 'pending',
        updatedAt: previousUpdate,
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/certification-centers/${certificationCenterId}/archive`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(204);

      const archivedCenter = await knex('certification-centers').where({ id: certificationCenterId }).first();
      expect(archivedCenter.archivedBy).to.deep.equal(superAdmin.id);
      expect(archivedCenter.archivedAt).to.be.instanceOf(Date);
      expect(archivedCenter.archivedAt).not.to.deep.equal(previousUpdate);

      const disabledMembership = await knex('certification-center-memberships')
        .where({ certificationCenterId })
        .first();
      expect(disabledMembership.updatedByUserId).to.equal(superAdmin.id);
      expect(disabledMembership.disabledAt).to.deep.equal(archivedCenter.archivedAt);

      const deletedInvitation = await knex('certification-center-invitations').where({ certificationCenterId });

      expect(deletedInvitation).to.be.empty;
    });
  });

  describe('GET /api/admin/certification-centers/batch-archive/template', function () {
    it('responds with a 200', async function () {
      // given
      const options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        url: '/api/admin/certification-centers/batch-archive/template',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/admin/certification-centers/batch-archive', function () {
    context('success case', function () {
      it('returns a 204 http request', async function () {
        // given
        const certificationCenterId1 = databaseBuilder.factory.buildCertificationCenter({
          archivedAt: null,
          archivedBy: null,
        }).id;
        const certificationCenterId2 = databaseBuilder.factory.buildCertificationCenter({
          archivedAt: null,
          archivedBy: null,
        }).id;

        await databaseBuilder.commit();
        const buffer =
          `ID du centre de certification\n` + `${certificationCenterId1}\n` + `${certificationCenterId2}\n`;

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/api/admin/certification-centers/batch-archive`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
          payload: buffer,
        });

        // then
        const archivedCertificationCenter1 = await knex('certification-centers')
          .where({ id: certificationCenterId1 })
          .first();
        const archivedCertificationCenter2 = await knex('certification-centers')
          .where({ id: certificationCenterId2 })
          .first();

        expect(response.statusCode).to.equal(204);
        expect(archivedCertificationCenter1.archivedBy).to.deep.equal(superAdmin.id);
        expect(archivedCertificationCenter2.archivedBy).to.deep.equal(superAdmin.id);
        expect(archivedCertificationCenter1.archivedAt).not.to.be.null;
        expect(archivedCertificationCenter2.archivedAt).not.to.be.null;
      });
    });

    context('error case', function () {
      it('returns an archive in batch error with meta info', async function () {
        // given
        const certificationCenterId1 = databaseBuilder.factory.buildCertificationCenter({
          archivedAt: null,
          archivedBy: null,
        }).id;
        const certificationCenterId2 = databaseBuilder.factory.buildCertificationCenter({
          archivedAt: null,
          archivedBy: null,
        }).id;

        const nonExistingCertifcationCenterId1 = 7895;
        const nonExistingCertifcationCenterId2 = 8513;

        await databaseBuilder.commit();
        const buffer =
          `ID du centre de certification\n` +
          `${certificationCenterId1}\n` +
          `${certificationCenterId2}\n` +
          `${nonExistingCertifcationCenterId1}\n` +
          `${nonExistingCertifcationCenterId2}\n`;

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/api/admin/certification-centers/batch-archive`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
          payload: buffer,
        });

        // then
        const archivedCertificationCenter1 = await knex('certification-centers')
          .where({ id: certificationCenterId1 })
          .first();
        const archivedCertificationCenter2 = await knex('certification-centers')
          .where({ id: certificationCenterId2 })
          .first();

        expect(response.statusCode).to.equal(422);
        expect(response.result.errors[0].code).to.deep.equal('ARCHIVE_CERTIFICATION_CENTERS_IN_BATCH_ERROR');
        expect(response.result.errors[0].meta).to.deep.equal({
          currentLine: 3,
          totalLines: 4,
        });
        expect(archivedCertificationCenter1.archivedBy).to.deep.equal(superAdmin.id);
        expect(archivedCertificationCenter2.archivedBy).to.deep.equal(superAdmin.id);
        expect(archivedCertificationCenter1.archivedAt).not.to.be.null;
        expect(archivedCertificationCenter2.archivedAt).not.to.be.null;
      });

      it('fails when the file payload is too large', async function () {
        const buffer = Buffer.alloc(1048576 * 22, 'B'); // > 10 Mo buffer

        const options = {
          method: 'POST',
          url: '/api/admin/certification-centers/batch-archive',
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
          payload: buffer,
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(413);
        expect(response.result.errors[0].code).to.equal('PAYLOAD_TOO_LARGE');
        expect(response.result.errors[0].meta.maxSize).to.equal('20');
      });
    });
  });

  describe('GET /api/admin/certification-centers/{certificationCenterId}/attached-organizations', function () {
    it('should return the organizations attached to a given certification center and http code 200', async function () {
      // given
      const server = await createServer();

      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      databaseBuilder.factory.buildOrganizationWithStructure({
        certificationCenterId: certificationCenter.id,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/certification-centers/${certificationCenter.id}/organizations`,
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdmin.id,
        }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].type).to.equal('attached-organizations');
    });
  });
});
