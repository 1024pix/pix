const DomainBuilder = require('./domain-builder');

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

  if (options.page) {
    return query.fetchPage({
      page: options.page.number,
      pageSize: options.page.size,
      withRelated,
    }).then((results) => {
      return {
        pagination: results.pagination,
        models: DomainBuilder.buildDomainObjects(results.models),
      };
    });
  }

  return query.fetch({ withRelated }).then(DomainBuilder.buildDomainObjects);
}
