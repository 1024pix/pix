import { InvalidAuthenticationDataError } from '../errors.js';
import { CampaignParticipation } from '../models/CampaignParticipation.js';
import { TubeCoverage } from '../models/TubeCoverage.js';

export const getCampaignParticipations = async ({
  campaignId,
  clientId,
  page,
  since,
  authenticationData,
  campaignsAPI,
  organizationRepository,
  authenticationMethodRepository,
  oidcProviderRepository,
}) => {
  const { models: campaignParticipations, meta } = await campaignsAPI.getCampaignParticipations({
    campaignId,
    page,
    since,
  });
  const identityProviderForCampaigns =
    await organizationRepository.findIdentityProviderForCampaignsByCampaignId(campaignId);

  const authenticationDataByUserId = await getAuthenticationDataByParticipations({
    campaignParticipations,
    authenticationData,
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
  authenticationData,
  identityProviderForCampaigns,
  authenticationMethodRepository,
  oidcProviderRepository,
}) => {
  if (!identityProviderForCampaigns) {
    return {};
  }

  if (authenticationData) {
    const claims = await oidcProviderRepository.findOidcProviderClaims(identityProviderForCampaigns);
    if (!areAuthenticationDataValid(authenticationData, claims)) {
      throw new InvalidAuthenticationDataError(`Invalid authenticationData, must be some of: ${claims.join(', ')}`);
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
      authenticationData: filterAuthenticationData(authenticationData, method.authenticationComplement),
    };
    return authenticationDataByUserId;
  }, {});
};

const areAuthenticationDataValid = (authenticationData, claims) => {
  if (!claims) return false;
  return authenticationData.every((authenticationClaim) => claims.includes(authenticationClaim));
};

const filterAuthenticationData = (authenticationData, authenticationComplement) => {
  if (!authenticationData) return null;
  const result = {};
  for (const claim of authenticationData) {
    result[claim] = authenticationComplement[claim];
  }
  return result;
};
