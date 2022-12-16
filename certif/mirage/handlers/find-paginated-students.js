import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

export function findPaginatedStudents(schema, request) {
  const queryParams = request.queryParams;
  const students = schema.students.all();

  const rowCount = students.length;

  const pagination = getPaginationFromQueryParams(queryParams);
  const divisionsFilter = queryParams['filter[divisions]'];
  if (divisionsFilter) {
    students.models = students.models.filter((student) => {
      return divisionsFilter.includes(student.division);
    });
  }

  const paginatedStudents = applyPagination(students.models, pagination);

  const json = this.serialize({ modelName: 'student', models: paginatedStudents }, 'student');
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}
