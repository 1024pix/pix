import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

export const findAutonomousCourseTargetProfiles = (schema) => {
  return schema.autonomousCourseTargetProfiles.all();
};

export const createAutonomousCourse = (schema, request) => {
  const params = JSON.parse(request.requestBody);

  return schema.create('autonomous-course', {
    ...params.data.attributes,
  });
};

export const getAutonomousCourseDetails = (schema, request) => {
  const autonomousCourseId = request.params.id;
  return schema.autonomousCourses.find(autonomousCourseId);
};

export function getPaginatedAutonomousCourses(schema, request) {
  const autonomousCourseListItems = schema.autonomousCourseListItems.all().models;

  const queryParams = request.queryParams;

  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedAutonomousCourses = applyPagination(autonomousCourseListItems, pagination);

  const json = this.serialize(
    { modelName: 'autonomous-course-list-item', models: paginatedAutonomousCourses },
    'autonomous-course-list-item',
  );
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount: autonomousCourseListItems.length,
    pageCount: 1,
  };

  return json;
}
