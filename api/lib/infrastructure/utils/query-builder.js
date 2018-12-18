const DomainBuilder = require('./domain-builder');

module.exports = { find };

function find(bookShelf, options) {
  return bookShelf
    .where(options.filter)
    .query((qb) => {
      options.sort.forEach((sort) => {
        const isDesc = sort.charAt(0) === '-';
        const column = isDesc ? sort.substring(1) : sort;
        const order = isDesc ? 'desc' : 'asc';

        qb.orderBy(column, order);
      });
    })
    .fetchPage({
      page: options.page.number,
      pageSize: options.page.size,
      withRelated: options.include,
    })
    .then((results) => {
      return {
        pagination: results.pagination,
        models: DomainBuilder.buildDomainObjects(results.models),
      };
    });
}
