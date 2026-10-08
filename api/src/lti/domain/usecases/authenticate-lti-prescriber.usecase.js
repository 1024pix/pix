import { LtiPrescriberAccessToken } from '../models/LtiPrescriberAccessToken.js';

// TODO: À valider avec Jonathan ? comment on lie à la création de la registration
// la registation à des networks/organizations ?

// TODO: À valider avec acquisition
// Ideally we would like api/src/organizational-entities/application/api/organization-api.js
// .findAllByOrganizationIdsAndNetworkId()

/**
 * @param {Array<string>} organizationExternalIds unique from a network: TODO: Validate this
 * @returns {string}
 */
export async function authenticateLtiPrescriber({ organizationExternalIds, organizationRepository, urlService }) {
  const locale = 'fr-FR'; // TODO: Generate this dynamically
  const organizationIds = [];
  for (const organizationExternalId of organizationExternalIds) {
    const organizations = await organizationRepository.findActiveScoOrganizationsByExternalId(organizationExternalId);
    organizationIds.push(...organizations.map((organization) => organization.id));
  }

  const scope = 'campaigns:read';
  const audience = urlService.getPixOrgaUrl(locale);
  const accessToken = LtiPrescriberAccessToken.generate({ organizationIds, scope, audience });
  return accessToken;
}
