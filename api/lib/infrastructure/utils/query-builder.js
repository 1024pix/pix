const bookshelfToDomainConverter = require('./bookshelf-to-domain-converter');
const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors');

module.exports = { get, find };

async function get(BookShelfClass, id, options, useDomainConverter = true) {
  const fetchOptions = {};

  if (options) {
    fetchOptions.withRelated = options.include;
  }

  const result = await BookShelfClass
    .where({ id })
    .fetch(fetchOptions);

  if (!result) {
    throw new NotFoundError(`Object with id : ${id} not found`);
  }

  if (useDomainConverter) {
    return bookshelfToDomainConverter.buildDomainObject(BookShelfClass, result);
  }

  return result;
}

async function find(BookShelfClass, options) {
  const query = BookShelfClass
    .where(options.filter)
    .query((qb) => {
      options.sort.forEach((sort) => {
        const isDesc = sort.charAt(0) === '-';
        const column = isDesc ? sort.substring(1) : sort;
        const order = isDesc ? 'desc' : 'asc';

        qb.orderBy(column, order);
      });
    });

  const withRelated = options.include;

  if (_.isEmpty(options.page)) {
    const results = await query.fetchAll({ withRelated });

    return {
      models: bookshelfToDomainConverter.buildDomainObjects(BookShelfClass, results.models),
    };
  }

  const results = await query.fetchPage({
    page: options.page.number,
    pageSize: options.page.size,
    withRelated,
  });

  return {
    pagination: results.pagination,
    models: bookshelfToDomainConverter.buildDomainObjects(BookShelfClass, results.models),
  };
}
