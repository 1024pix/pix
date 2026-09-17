import { createOrganizationZodSchema, toSchemaValidationError } from '../../domain/tool-schemas.js';
import { createOrganization } from '../../domain/usecases/create-organization.js';
import { listReferenceValues } from '../../domain/usecases/list-reference-values.js';
import { makeAdministrationTeamRepository } from '../../infrastructure/repositories/administration-team.repository.js';
import { makeCountryRepository } from '../../infrastructure/repositories/country.repository.js';
import { makeOrganizationRepository } from '../../infrastructure/repositories/organization.repository.js';
import { makeOrganizationLearnerTypeRepository } from '../../infrastructure/repositories/organization-learner-type.repository.js';

/**
 * API interne du contexte mcp-admin-server.
 *
 * Permet aux autres contextes (llm-assistant) d'appeler les outils
 * d'administration directement en process, sans passer par le transport MCP
 * ni par un aller-retour HTTP du serveur vers lui-même.
 *
 * @module ToolsApi
 */

/**
 * Mémoïse `findAll()` sur la durée de vie du runner.
 *
 * Les référentiels (équipes, types d'apprenants, pays) sont identiques pour
 * toutes les lignes d'un même lot. Sans cette mémoïsation, chaque ligne les
 * recharge, soit trois requêtes HTTP internes par ligne.
 */
const _memoizeFindAll = function (repository) {
  let pending = null;
  return {
    ...repository,
    findAll: () => (pending ??= repository.findAll()),
  };
};

/**
 * Construit un exécuteur d'outils dont les référentiels sont mis en cache pour
 * toute sa durée de vie. En créer un par lot, pas un par ligne.
 *
 * `apiBaseUrl` et les en-têtes restent nécessaires : les repositories de ce
 * contexte s'adressent aux APIs internes de Pix en HTTP.
 *
 * @param {object} params
 * @param {string} params.apiBaseUrl
 * @param {string} params.authorizationHeader
 * @param {object} [params.forwardedHeaders]
 */
const createToolsRunner = function ({ apiBaseUrl, authorizationHeader, forwardedHeaders = {} }) {
  const headers = {
    Authorization: authorizationHeader,
    ...forwardedHeaders,
    'Content-Type': 'application/json',
  };

  const repositories = {
    administrationTeamRepository: _memoizeFindAll(makeAdministrationTeamRepository({ apiBaseUrl, headers })),
    organizationLearnerTypeRepository: _memoizeFindAll(makeOrganizationLearnerTypeRepository({ apiBaseUrl, headers })),
    countryRepository: _memoizeFindAll(makeCountryRepository({ apiBaseUrl, headers })),
    organizationRepository: makeOrganizationRepository({ apiBaseUrl, headers }),
  };

  return {
    /**
     * Valide puis exécute un outil. Reproduit la validation Zod du transport
     * MCP pour que les deux chemins d'appel se comportent à l'identique.
     *
     * @param {object} params
     * @param {string} params.name
     * @param {object} [params.args]
     */
    async callTool({ name, args = {} }) {
      if (name === 'create_organization') {
        const parsed = createOrganizationZodSchema.safeParse(args);
        if (!parsed.success) {
          return toSchemaValidationError(parsed.error);
        }
        return createOrganization({ args: parsed.data, ...repositories });
      }

      if (name === 'list_reference_values') {
        return listReferenceValues({ target: args.target, ...repositories });
      }

      return { error: { unknownTool: name } };
    },
  };
};

export { createToolsRunner };
