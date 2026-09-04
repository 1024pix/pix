import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { createOrganization } from '../../domain/usecases/create-organization.js';
import { listReferenceValues } from '../../domain/usecases/list-reference-values.js';
import { makeAdministrationTeamRepository } from '../repositories/administration-team.repository.js';
import { makeCountryRepository } from '../repositories/country.repository.js';
import { makeOrganizationRepository } from '../repositories/organization.repository.js';
import { makeOrganizationLearnerTypeRepository } from '../repositories/organization-learner-type.repository.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';

const CREATE_ORGANIZATION_SCHEMA = {
  name: z.string().describe("Nom de l'organisation"),
  type: z.enum(['SCO', 'SUP', 'PRO', 'SCO-1D']).describe("Type d'organisation"),
  administrationTeamName: z.string().describe("Nom de l'équipe en charge"),
  organizationLearnerTypeName: z.string().describe('Nom du public prescrit'),
  countryName: z.string().describe('Nom du pays'),
  externalId: z.string().optional().describe('Identifiant externe (UAI, SIRET…)'),
  simulate: z.boolean().optional().describe('Si true, simule la création sans appel API'),
};
const createOrganizationZodSchema = z.object(CREATE_ORGANIZATION_SCHEMA);

const createMcpServer = async function ({ authorizationHeader, forwardedHeaders = {}, apiBaseUrl }) {
  const server = new McpServer({ name: 'pix-admin', version: '1.0.0' });
  const headers = { Authorization: authorizationHeader, ...forwardedHeaders, 'Content-Type': 'application/json' };

  const repositories = {
    administrationTeamRepository: makeAdministrationTeamRepository({ apiBaseUrl, headers }),
    organizationLearnerTypeRepository: makeOrganizationLearnerTypeRepository({ apiBaseUrl, headers }),
    countryRepository: makeCountryRepository({ apiBaseUrl, headers }),
    organizationRepository: makeOrganizationRepository({ apiBaseUrl, headers }),
  };

  server.tool(
    'create_organization',
    CREATE_ORGANIZATION_SCHEMA,
    async (args) => {
      const t0 = Date.now();
      logger.info(`mcp create_organization → (simulate=${args.simulate ?? false})`);

      const parsed = createOrganizationZodSchema.safeParse(args);
      if (!parsed.success) {
        const err = parsed.error.errors[0];
        const result = { error: { notFound: err.path.join('.'), message: err.message } };
        logger.info(`mcp create_organization ← ${Date.now() - t0}ms validation-error: ${err.message}`);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }

      try {
        const result = await createOrganization({ args: parsed.data, ...repositories });
        logger.info(`mcp create_organization ← ${Date.now() - t0}ms ok`);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (err) {
        logger.info(`mcp create_organization ← ${Date.now() - t0}ms erreur: ${err.message}`);
        throw err;
      }
    },
  );

  server.tool(
    'list_reference_values',
    { target: z.string().describe('sujet:propriété — ex. organization:administrationTeamName') },
    { readOnlyHint: true },
    async ({ target }) => {
      const result = await listReferenceValues({ target, ...repositories });
      if (result.error) {
        return { isError: true, content: [{ type: 'text', text: JSON.stringify(result) }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  );

  return server;
};

export { createMcpServer };
