import _ from 'lodash';

export function findPaginatedCampaignAssessmentParticipationSummaries(schema, request) {
  const queryParams = request.queryParams;
  const summaries = schema.campaignAssessmentParticipationSummaries.all().models;
  const rowCount = summaries.length;

  const pagination = _getPaginationFromQueryParams(queryParams);
  const paginatedSummaries = _applyPagination(summaries, pagination);

  const json = this.serialize({ modelName: 'campaign-assessment-participation-summary', models: paginatedSummaries }, 'campaign-assessment-participation-summary');
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}

function _getPaginationFromQueryParams(queryParams) {
  return {
    pageSize: parseInt(_.get(queryParams, 'page[size]',  10)),
    page: parseInt(_.get(queryParams, 'page[number]',  1))
  };
}

function _applyPagination(summaries, { page, pageSize }) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return _.slice(summaries, start, end);
}
