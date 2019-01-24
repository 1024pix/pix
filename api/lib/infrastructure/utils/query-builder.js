const bookshelfToDomainConverter = require('./bookshelf-to-domain-converter');
const _ = require('lodash');

module.exports = { get, find };

async function get(bookShelf, id, options) {
  const fetchOptions = { required: true };
  
  if (options && options.include) {
    fetchOptions.withRelated = options.include;
  }

  const result = await bookShelf
    .where({ id })
    .fetch(fetchOptions);

  return bookshelfToDomainConverter.buildDomainObject(result);
}

async function find(bookShelf, options) {
  const query = bookShelf
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
      models: bookshelfToDomainConverter.buildDomainObjects(results.models)
    };
  }

  const results = await query.fetchPage({
    page: options.page.number,
    pageSize: options.page.size,
    withRelated,
  });

  return {
    pagination: results.pagination,
    models: bookshelfToDomainConverter.buildDomainObjects(results.models),
  };
}
