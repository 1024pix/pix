const dragonLogo = require('../../../../db/seeds/src/dragonAndCoBase64');

const {
  expect,
  knex,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} = require('../../../test-helper');

const createServer = require('../../../../server');

const { logo3Mb } = require('./_files/logo-3mb');

describe('Acceptance | Application | organization-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('PATCH /api/admin/organizations/{id}', function () {
    afterEach(async function () {
      await knex('organization-tags').delete();
      await knex('data-protection-officers').delete();
    });

    it('should return the updated organization and status code 200', async function () {
      // given
      const logo = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      const organizationAttributes = {
        externalId: '0446758F',
        provinceCode: '044',
        email: 'sco.generic.newaccount@example.net',
        credit: 50,
        logoUrl: logo,
      };
      const organization = databaseBuilder.factory.buildOrganization({ ...organizationAttributes });
      const tag1 = databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' });
      await databaseBuilder.commit();

      const newLogo = dragonLogo;
      const payload = {
        data: {
          type: 'organizations',
          id: organization.id,
          attributes: {
            'external-id': organizationAttributes.externalId,
            'province-code': organizationAttributes.provinceCode,
            email: organizationAttributes.email,
            credit: organizationAttributes.credit,
            'logo-url': newLogo,
          },
          relationships: {
            tags: {
              data: [{ type: 'tags', id: tag1.id }],
            },
          },
        },
      };
      const options = {
        method: 'PATCH',
        url: `/api/admin/organizations/${organization.id}`,
        payload,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes['external-id']).to.equal('0446758F');
      expect(response.result.data.attributes['province-code']).to.equal('044');
      expect(response.result.data.attributes['email']).to.equal('sco.generic.newaccount@example.net');
      expect(response.result.data.attributes['credit']).to.equal(50);
      expect(response.result.data.attributes['logo-url']).to.equal(newLogo);
      expect(response.result.data.relationships.tags.data[0]).to.deep.equal({ type: 'tags', id: tag1.id.toString() });
      expect(parseInt(response.result.data.id)).to.equal(organization.id);
    });

    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        await databaseBuilder.commit();
        const payload = {
          data: {
            type: 'organizations',
            id: organization.id,
            attributes: {
              'external-id': '0446758F',
              'province-code': '044',
              email: 'sco.generic.newaccount@example.net',
              credit: 50,
            },
          },
        };
        const options = {
          method: 'PATCH',
          url: `/api/admin/organizations/${organization.id}`,
          payload,
          headers: { authorization: 'invalid.access.token' },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user has not role Super Admin', async function () {
        // given
        const nonSuperAdminUserId = 9999;
        const organization = databaseBuilder.factory.buildOrganization();
        await databaseBuilder.commit();
        const payload = {
          data: {
            type: 'organizations',
            id: organization.id,
            attributes: {
              'external-id': '0446758F',
              'province-code': '044',
              email: 'sco.generic.newaccount@example.net',
              credit: 50,
            },
          },
        };
        const options = {
          method: 'PATCH',
          url: `/api/admin/organizations/${organization.id}`,
          payload,
          headers: { authorization: generateValidRequestAuthorizationHeader(nonSuperAdminUserId) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when the payload size is greater than 2.5MB size limit', function () {
      it('returns a 413 payload too large error', async function () {
        // given
        const logo = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        const organizationAttributes = {
          externalId: '0446758F',
          provinceCode: '044',
          email: 'sco.generic.newaccount@example.net',
          credit: 50,
          logoUrl: logo,
        };
        const organization = databaseBuilder.factory.buildOrganization({ ...organizationAttributes });
        const tag1 = databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' });
        await databaseBuilder.commit();

        const payload = {
          data: {
            type: 'organizations',
            id: organization.id,
            attributes: {
              'external-id': organizationAttributes.externalId,
              'province-code': organizationAttributes.provinceCode,
              email: organizationAttributes.email,
              credit: organizationAttributes.credit,
              'logo-url': logo3Mb,
            },
            relationships: {
              tags: {
                data: [{ type: 'tags', id: tag1.id }],
              },
            },
          },
        };
        const options = {
          method: 'PATCH',
          url: `/api/admin/organizations/${organization.id}`,
          payload,
          headers: { authorization: generateValidRequestAuthorizationHeader() },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(413);
        expect(response.result.errors[0].code).to.equal('PAYLOAD_TOO_LARGE');
        expect(response.result.errors[0].meta.maxSizeInMegaBytes).to.equal('2.5');
      });
    });
  });
});
