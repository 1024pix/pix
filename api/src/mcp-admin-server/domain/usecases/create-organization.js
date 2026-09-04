/**
 * Usecase — Création d'une organisation.
 *
 * Résout les libellés humains (administrationTeamName, organizationLearnerTypeName, countryName)
 * en identifiants techniques via les repositories injectés, puis soumet le payload JSON:API.
 *
 * Retourne :
 *   - `{ id, name }` en cas de succès (201)
 *   - `{ wouldCreate: { name, type, administrationTeamName, organizationLearnerTypeName, countryName, externalId } }` si simulate === true (aucun appel POST émis)
 *   - `{ error: { notFound, availableValues } }` si un libellé est introuvable
 *   - `{ error: { status: 422, fieldErrors } }` si le serveur répond 422
 */

const createOrganization = async function ({
  args,
  administrationTeamRepository,
  organizationLearnerTypeRepository,
  countryRepository,
  organizationRepository,
}) {
  const { name, type, administrationTeamName, organizationLearnerTypeName, countryName, externalId, simulate } = args;

  const VALID_TYPES = ['SCO', 'SUP', 'PRO', 'SCO-1D'];
  if (!VALID_TYPES.includes(type)) {
    return { error: { notFound: 'type', availableValues: VALID_TYPES } };
  }

  // Paralléliser les 3 lookups
  const [administrationTeams, organizationLearnerTypes, countries] = await Promise.all([
    administrationTeamRepository.findAll(),
    organizationLearnerTypeRepository.findAll(),
    countryRepository.findAll(),
  ]);

  // 1. Résoudre administrationTeamName → administration-team-id
  const administrationTeam = administrationTeams.find((t) => t.name === administrationTeamName);
  if (!administrationTeam) {
    return {
      error: {
        notFound: 'administrationTeamName',
        availableValues: administrationTeams.map((t) => t.name),
      },
    };
  }

  // 2. Résoudre organizationLearnerTypeName → organizationLearnerType-id
  const organizationLearnerType = organizationLearnerTypes.find((t) => t.name === organizationLearnerTypeName);
  if (!organizationLearnerType) {
    return {
      error: {
        notFound: 'organizationLearnerTypeName',
        availableValues: organizationLearnerTypes.map((t) => t.name),
      },
    };
  }

  // 3. Résoudre countryName → country-code
  const country = countries.find((c) => c.name === countryName);
  if (!country) {
    return {
      error: {
        notFound: 'countryName',
        availableValues: countries.map((c) => c.name),
      },
    };
  }

  // 4. Construire le payload JSON:API kebab-case
  const attributes = {
    name,
    type,
    'administration-team-id': administrationTeam.id,
    'organization-learner-type-id': organizationLearnerType.id,
    'organization-learner-type-name': organizationLearnerTypeName,
    'country-code': country.code,
  };

  if (externalId !== undefined && externalId !== null) {
    attributes['external-id'] = externalId;
  }

  // simulate:true — tous les libellés ont été résolus mais on n'émet pas le POST
  if (simulate) {
    return { wouldCreate: { name, type, administrationTeamName, organizationLearnerTypeName, countryName, externalId } };
  }

  const payload = {
    data: {
      type: 'organizations',
      attributes,
    },
  };

  // POST /api/admin/organizations via repository
  const { status, body } = await organizationRepository.create(payload);

  if (status === 422) {
    return {
      error: {
        status: 422,
        fieldErrors: body.errors,
      },
    };
  }

  const organizationData = body.data;
  return {
    id: organizationData.id,
    name: organizationData.attributes.name,
  };
};

export { createOrganization };
