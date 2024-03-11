import { applyPagination, getPaginationFromQueryParams } from './pagination-utils';

export function findPaginatedCampaignProfilesCollectionParticipationSummaries(schema, request) {
  const queryParams = request.queryParams;
  const summaries = schema.campaignProfilesCollectionParticipationSummaries.all().models;
  const rowCount = summaries.length;

  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedSummaries = applyPagination(summaries, pagination);

  const json = this.serialize(
    { modelName: 'campaign-profiles-collection-participation-summary', models: paginatedSummaries },
    'campaign-profiles-collection-participation-summary',
  );
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}
