const DEFAULT_PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 10,
};

function paginate(data, { number = DEFAULT_PAGINATION.PAGE, size = DEFAULT_PAGINATION.PAGE_SIZE } = {}) {
  const pageCount = Math.ceil(data.length / size);
  const page = Math.min(Math.max(number, 1), Math.max(pageCount, 1));
  return {
    results: data.slice((page - 1) * size, page * size),
    pagination: {
      page,
      pageSize: size,
      rowCount: data.length,
      pageCount: Math.ceil(data.length / size),
    },
  };
}

export default { paginate };
