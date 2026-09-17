import { z } from 'zod';

/**
 * Schémas des outils exposés par le serveur MCP d'administration.
 *
 * Définis ici plutôt que dans l'infrastructure MCP : ils sont partagés par le
 * transport MCP (infrastructure/mcp/mcp-server.js) et par l'appel direct
 * en process (application/api/tools-api.js), qui doivent valider à l'identique.
 */

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

const LIST_REFERENCE_VALUES_SCHEMA = {
  target: z.string().describe('sujet:propriété — ex. organization:administrationTeamName'),
};

/**
 * Forme d'erreur du gestionnaire d'outil MCP : `{ error: { notFound, availableValues } }`.
 * Signale un champ dont la valeur ne fait pas partie des valeurs acceptées.
 */
const toFieldValidationError = function (parseError) {
  const issue = parseError.issues[0];
  return {
    error: {
      notFound: issue.path.join('.'),
      availableValues: issue.values ?? issue.options ?? [],
    },
  };
};

/**
 * Forme d'erreur `{ error: { validation } }`, rendue au client quand les
 * arguments ne respectent pas le schéma.
 *
 * Le transport MCP produisait cette forme à partir de ses propres messages de
 * protocole. L'appel en process ne passant plus par lui, le message est
 * reconstruit ici — sans référence au protocole, qui n'a jamais eu sa place
 * dans une réponse destinée au client.
 */
const toSchemaValidationError = function (parseError) {
  const issue = parseError.issues[0];
  const field = issue.path.join('.');
  return { error: { validation: field ? `${field}: ${issue.message}` : issue.message } };
};

export {
  CREATE_ORGANIZATION_SCHEMA,
  createOrganizationZodSchema,
  LIST_REFERENCE_VALUES_SCHEMA,
  toFieldValidationError,
  toSchemaValidationError,
};
