import { getPaginationFromQueryParams, applyPagination } from '../../handlers/pagination-utils';

export default function (schema, request) {
  const queryParams = request.queryParams;
  const userId = request.params.id;

  const trainings = schema.users.find(userId).trainings.models;

  const rowCount = trainings.length;
  const pagination = getPaginationFromQueryParams(queryParams);

  const paginatedTrainings = applyPagination(trainings, pagination);

  const json = this.serialize({ modelName: 'training', models: paginatedTrainings }, 'training');

  json.meta = {
    pagination: {
      ...pagination,
      rowCount,
      pageCount: Math.ceil(rowCount / pagination.pageSize),
    },
  };
  return json;
}
