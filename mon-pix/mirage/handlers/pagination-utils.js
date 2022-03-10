import slice from 'lodash/slice';

const TEST_DEFAULT_PAGE_SIZE = 10;

export function getPaginationFromQueryParams(queryParams) {
  return {
    pageSize: parseInt(queryParams['page[size]']) || TEST_DEFAULT_PAGE_SIZE,
    page: parseInt(queryParams['page[number]']) || 1,
  };
}

export function applyPagination(data, { page, pageSize }) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return slice(data, start, end);
}
