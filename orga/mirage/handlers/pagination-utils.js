import slice from 'lodash/slice';

export function getPaginationFromQueryParams(queryParams) {
  return {
    pageSize: parseInt(queryParams['page[size]'] ||  10),
    page: parseInt(queryParams['page[number]'] || 1)
  };
}

export function applyPagination(data, { page, pageSize }) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return slice(data, start, end);
}
