import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { logger } from '../../../shared/infrastructure/utils/logger.js';
import {
  CREATE_ORGANIZATION_SCHEMA,
  createOrganizationZodSchema,
  LIST_REFERENCE_VALUES_SCHEMA,
  toValidationError,
} from '../../domain/tool-schemas.js';
import { createOrganization } from '../../domain/usecases/create-organization.js';
import { listReferenceValues } from '../../domain/usecases/list-reference-values.js';
import { makeAdministrationTeamRepository } from '../repositories/administration-team.repository.js';
import { makeCountryRepository } from '../repositories/country.repository.js';
import { makeOrganizationRepository } from '../repositories/organization.repository.js';
import { makeOrganizationLearnerTypeRepository } from '../repositories/organization-learner-type.repository.js';

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
        const result = toValidationError(parsed.error);
        logger.info(`mcp create_organization ← ${Date.now() - t0}ms validation-error: ${parsed.error.issues[0].message}`);
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
    LIST_REFERENCE_VALUES_SCHEMA,
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
