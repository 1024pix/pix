const DomainBuilder = require('./domain-builder');
const _ = require('lodash');

module.exports = { find };

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

    return DomainBuilder.buildDomainObjects(results.models);
  }

  const results = await query.fetchPage({
    page: options.page.number,
    pageSize: options.page.size,
    withRelated,
  });

  return {
    pagination: results.pagination,
    models: DomainBuilder.buildDomainObjects(results.models),
  };
}
