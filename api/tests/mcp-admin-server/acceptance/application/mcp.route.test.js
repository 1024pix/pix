import nock from 'nock';

import { createServer } from '../../../../server.js';
import { createMcpClient } from '../../../../src/llm-assistant/infrastructure/mcp/mcp-client.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/constants.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { getServer } from '../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | McpAdminServer | Application | Route | MCP', function () {
  describe('scenario 1: 401 without token', function () {
    it('returns 401 on POST /api/admin/mcp without Authorization', async function () {
      // given
      const server = await getServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/admin/mcp',
        payload: { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
      });

      // then
      expect(response.statusCode).to.equal(401);
    });
  });

  describe('scenarios requiring a real HTTP server', function () {
    let httpServer;
    let apiBaseUrl;
    let superAdmin;
    let authorizationHeader;
    let forwardedHeaders;

    beforeEach(async function () {
      superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);
      await databaseBuilder.commit();

      httpServer = await createServer();
      await httpServer.start();
      apiBaseUrl = `http://localhost:${httpServer.info.port}`;
      nock.enableNetConnect();

      const headers = generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id });
      authorizationHeader = headers.authorization;
      // Le JWT est signé avec l'audience https://app.pix.org : les forwarded headers doivent
      // correspondre pour que la validation JWT réussisse dans createMcpClient.
      forwardedHeaders = {
        'x-forwarded-proto': headers['x-forwarded-proto'],
        'x-forwarded-host': headers['x-forwarded-host'],
      };
    });

    afterEach(async function () {
      nock.disableNetConnect();
      nock.enableNetConnect('localhost:9090');
      await httpServer.stop({ timeout: 0 });
    });

    describe('scenario 2: create_organization tool is listed', function () {
      it('lists create_organization via MCP client', async function () {
        // when
        const client = await createMcpClient({ authorizationHeader, apiBaseUrl, forwardedHeaders });
        const { tools } = await client.listTools();

        // then
        const toolNames = tools.map((t) => t.name);
        expect(toolNames).to.include('create_organization');
      });
    });

    describe('scenario 3: a creation succeeds', function () {
      it('creates an organization in database with createdBy = user id', async function () {
        // given
        const administrationTeam = databaseBuilder.factory.buildAdministrationTeam({ name: 'Équipe Test MCP' });
        const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
          name: 'Apprenants Test MCP',
        });
        databaseBuilder.factory.buildCertificationCpfCountry({
          code: 99100,
          commonName: 'France',
          originalName: 'France',
        });
        await databaseBuilder.commit();

        const client = await createMcpClient({ authorizationHeader, apiBaseUrl, forwardedHeaders });

        // when
        const result = await client.callTool({
          name: 'create_organization',
          arguments: {
            name: 'Organisation MCP Test',
            type: 'PRO',
            administrationTeamName: administrationTeam.name,
            organizationLearnerTypeName: organizationLearnerType.name,
            countryName: 'France',
            externalId: 'MCP-TEST-001',
          },
        });

        // then
        expect(result).to.have.nested.property('content[0].type', 'text');
        const data = JSON.parse(result.content[0].text);
        expect(data).to.have.property('id');
        expect(data).to.have.property('name', 'Organisation MCP Test');

        const organizations = await knex('organizations').where({ name: 'Organisation MCP Test' });
        expect(organizations).to.have.lengthOf(1);
        expect(organizations[0]).to.deep.include({
          name: 'Organisation MCP Test',
          type: 'PRO',
          createdBy: superAdmin.id,
          administrationTeamId: administrationTeam.id,
          organizationLearnerTypeId: organizationLearnerType.id,
        });
      });
    });
  });
});
