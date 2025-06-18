import { usecases } from '../domain/usecases/index.js';

export async function getCampaignParticipations(
  request,
  h,
  dependencies = { getCampaignParticipations: usecases.getCampaignParticipations },
) {
  const { page } = request.query;
  const { models: campaignParticipations, meta } = await dependencies.getCampaignParticipations({
    campaignId: request.params.campaignId,
    clientId: request.auth.credentials.client_id,
    page,
  });
  return h
    .response({ campaignParticipations, page: { number: meta.page, size: meta.pageSize, count: meta.pageCount } })
    .code(200);
}
