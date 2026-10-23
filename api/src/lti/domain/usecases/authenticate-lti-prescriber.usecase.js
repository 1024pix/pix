import { LtiPrescriberAccessToken } from '../models/LtiPrescriberAccessToken.js';

// TODO: À valider avec Jonathan ? comment on lie à la création de la registration
// la registation à des networks/organizations ?

// TODO: À valider avec acquisition
// Ideally we would like api/src/organizational-entities/application/api/organization-api.js
// .findAllByOrganizationIdsAndNetworkId()

/**
 * @param {object} args
 * @param {Array<string>} args.organizationExternalIds
 * @param {import('../models/LtiPlatformRegistration.js').LtiPlatformRegistration} args.registration
 * @param {object} args.deepLinkingSettings
 */
export async function authenticateLtiPrescriber({
  organizationExternalIds,
  registration,
  deepLinkingSettings,
  organizationRepository,
  urlService,
}) {
  const locale = 'fr-FR'; // TODO: Generate this dynamically
  const organizationIds = [];
  for (const organizationExternalId of organizationExternalIds) {
    const organizations = await organizationRepository.findActiveScoOrganizationsByExternalId(organizationExternalId);
    organizationIds.push(...organizations.map((organization) => organization.id));
  }

  const scope = 'campaigns:read';
  const audience = urlService.getPixOrgaUrl(locale);
  const sessionId = crypto.randomUUID();
  const accessToken = new LtiPrescriberAccessToken({
    organizationIds,
    clientId: registration.clientId,
    deepLinkingSettings,
    scope,
    audience,
    sessionId,
  });
  return accessToken;
}
