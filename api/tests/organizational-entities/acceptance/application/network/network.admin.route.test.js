import { createServer } from '../../../../../server.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Organizational Entities | Application | Route | Admin | Network', function () {
  let superAdmin;
  let server;

  beforeEach(async function () {
    superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
    await databaseBuilder.commit();

    server = await createServer();
  });

  describe('GET /api/admin/networks', function () {
    it('returns a list of networks with 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const network1 = databaseBuilder.factory.buildNetwork({ name: 'Team1' });
      const network2 = databaseBuilder.factory.buildNetwork({ name: 'Team2' });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: '/api/admin/networks',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };
      const expectedNetworks = [
        {
          attributes: {
            name: network1.name,
          },
          id: network1.id.toString(),
          type: 'networks',
        },
        {
          attributes: {
            name: network2.name,
          },
          id: network2.id.toString(),
          type: 'networks',
        },
      ];

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal(expectedNetworks);
    });
  });

  describe('GET /api/admin/networks/1', function () {
    it('returns a specific network with 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const { network } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
        id: 1,
        name: 'Mon réseau',
        headOrganization: { id: 555, name: 'Tête de réseau' },
      });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: '/api/admin/networks/1',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };
      const expectedNetwork = {
        attributes: {
          name: network.name,
          'head-organization': {
            id: 555,
            name: 'Tête de réseau',
          },
        },
        id: network.id.toString(),
        type: 'networks',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal(expectedNetwork);
    });
  });

  describe('PATCH /api/admin/networks/{networkId}', function () {
    it('updates the network name and returns 200', async function () {
      // given
      const { network } = databaseBuilder.factory.buildNetworkAndHeadOrganization({ name: 'Ancien nom' });
      await databaseBuilder.commit();

      const request = {
        method: 'PATCH',
        url: `/api/admin/networks/${network.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            attributes: {
              name: 'Nouveau nom',
            },
          },
        },
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes.name).to.equal('Nouveau nom');
    });
  });

  describe('GET /api/admin/networks with filter', function () {
    it('returns filtered networks by name with 200 HTTP status code', async function () {
      // given
      const matchingNetwork = databaseBuilder.factory.buildNetwork({ name: 'Réseau Bretagne' });
      databaseBuilder.factory.buildNetwork({ name: 'Autre réseau' });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/networks?filter[name]=Bretagne',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(1);
      expect(response.result.data[0].id).to.equal(matchingNetwork.id.toString());
      expect(response.result.data[0].attributes.name).to.equal(matchingNetwork.name);
    });
  });

  describe('POST /api/admin/networks', function () {
    it('creates a new network', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      const request = {
        method: 'POST',
        url: '/api/admin/networks',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            attributes: {
              name: 'Network name',
              'organization-id': organizationId,
            },
          },
        },
      };

      // when
      const response = await server.inject(request);

      // then
      const createdNetwork = await knex('networks').first();
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.id).to.equal(createdNetwork.id.toString());
      expect(response.result.data.attributes.name).to.equal('Network name');
    });
  });
});
