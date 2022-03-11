const DEFAULT_PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 10,
};

/**
 * @typedef PageInput
 * @type {object}
 * @property {number} [number]
 * @property {number} [size]
 */

/**
 * @typedef Page
 * @type {object}
 * @property {Object[]} results
 * @property {Object} pagination
 * @property {number} pagination.page
 * @property {number} pagination.pageSize
 * @property {number} pagination.rowCount
 * @property {number} pagination.pageCount
 */

/**
 * @param {Object[]} data
 * @param {Object} [config]
 * @param {number} [config.number=DEFAULT_PAGINATION.PAGE]
 * @param {number} [config.size=DEFAULT_PAGINATION.PAGE_SIZE]
 * @returns {Page}
 */
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

module.exports = paginate;
