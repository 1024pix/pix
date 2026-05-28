import { InvalidAuthenticationDataError } from '../errors.js';
import { CampaignParticipation } from '../models/CampaignParticipation.js';
import { TubeCoverage } from '../models/TubeCoverage.js';

export const getCampaignParticipations = async ({
  campaignId,
  clientId,
  page,
  since,
  sort,
  authenticationRequestedData,
  campaignsAPI,
  organizationRepository,
  authenticationMethodRepository,
  oidcProviderRepository,
}) => {
  const { models: campaignParticipations, meta } = await campaignsAPI.getCampaignParticipations({
    campaignId,
    page,
    since,
    sort,
  });
  const identityProviderForCampaigns =
    await organizationRepository.findIdentityProviderForCampaignsByCampaignId(campaignId);

  const authenticationDataByUserId = await getAuthenticationDataByParticipations({
    campaignParticipations,
    authenticationRequestedData,
    identityProviderForCampaigns,
    authenticationMethodRepository,
    oidcProviderRepository,
  });

  const models = campaignParticipations.map((rawCampaignParticipation) => {
    const userAuthenticationData = authenticationDataByUserId[rawCampaignParticipation.userId];
    return toDomain(rawCampaignParticipation, userAuthenticationData, clientId, campaignId);
  });
  return {
    models,
    meta,
  };
};

const toDomain = (rawCampaignParticipation, userAuthenticationData, clientId, campaignId) =>
  new CampaignParticipation({
    ...rawCampaignParticipation,
    ...userAuthenticationData,
    id: rawCampaignParticipation.id, // needed to invoke the getter
    tubes: rawCampaignParticipation.tubes?.map((tube) => new TubeCoverage(tube)),
    clientId,
    campaignId,
  });

const getAuthenticationDataByParticipations = async ({
  campaignParticipations,
  authenticationRequestedData,
  identityProviderForCampaigns,
  authenticationMethodRepository,
  oidcProviderRepository,
}) => {
  if (!identityProviderForCampaigns) {
    return {};
  }

  if (authenticationRequestedData) {
    const claims = await oidcProviderRepository.findOidcProviderClaims(identityProviderForCampaigns);
    if (!areAuthenticationDataValid(authenticationRequestedData, claims)) {
      throw new InvalidAuthenticationDataError(
        `Invalid authenticationRequestedData, must be some of: ${claims.join(', ')}`,
      );
    }
  }

  const userIds = campaignParticipations.map((participation) => participation.userId).filter(Number);
  const authenticationMethods = await authenticationMethodRepository.findByUserIdsAndIdentityProvider({
    userIds,
    identityProvider: identityProviderForCampaigns,
  });

  return authenticationMethods.reduce((authenticationDataByUserId, method) => {
    authenticationDataByUserId[method.userId] = {
      authenticationId: method.externalIdentifier,
      authenticationRequestedData: filterAuthenticationData(
        authenticationRequestedData,
        method.authenticationComplement,
      ),
    };
    return authenticationDataByUserId;
  }, {});
};

const areAuthenticationDataValid = (authenticationRequestedData, claims) => {
  if (!claims) return false;
  return authenticationRequestedData.every((authenticationClaim) => claims.includes(authenticationClaim));
};

const filterAuthenticationData = (authenticationRequestedData, authenticationComplement) => {
  if (!authenticationRequestedData) return null;
  const result = {};
  for (const claim of authenticationRequestedData) {
    result[claim] = authenticationComplement[claim];
  }
  return result;
};
