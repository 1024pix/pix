import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

export function findFilteredPaginatedStudents(schema, request) {
  const organizationId = request.params.id;
  const queryParams = request.queryParams;
  const students = _filtersFromQueryParams(schema, organizationId, queryParams);

  const rowCount = students.length;

  const pagination = getPaginationFromQueryParams(queryParams);
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

function _filtersFromQueryParams(schema, organizationId, queryParams) {
  const lastNameFilter = queryParams['filter[lastName]'];
  if (lastNameFilter) {
    return schema.students.where(({ lastName }) => lastName.includes(lastNameFilter));
  }

  const firstNameFilter = queryParams['filter[firstName]'];
  if (firstNameFilter) {
    return schema.students.where(({ firstName }) => firstName.includes(firstNameFilter));
  }

  const connexionTypeFilter = queryParams['filter[connexionType]'];
  if (connexionTypeFilter) {
    return schema.students.where((student) => {
      if (connexionTypeFilter === '') return true;
      if (connexionTypeFilter === 'identifiant' && student.hasUsername) return true;
      if (connexionTypeFilter === 'email' && student.hasEmail) return true;
      if (connexionTypeFilter === 'mediacentre' && student.isAuthenticatedFromGar) return true;
      return false;
    });
  }

  return schema.students.where({ organizationId });
}
