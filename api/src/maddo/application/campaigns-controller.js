import { usecases } from '../domain/usecases/index.js';

export async function getCampaignParticipations(
  request,
  h,
  dependencies = { getCampaignParticipations: usecases.getCampaignParticipations },
) {
  const { page, since, authenticationData = [] } = request.query;
  const { models: campaignParticipations, meta } = await dependencies.getCampaignParticipations({
    campaignId: request.params.campaignId,
    clientId: request.auth.credentials.client_id,
    authenticationData: Array.isArray(authenticationData) ? authenticationData : [authenticationData],
    page,
    since,
  });
  return h
    .response({ campaignParticipations, page: { number: meta.page, size: meta.pageSize, count: meta.pageCount } })
    .code(200);
}
