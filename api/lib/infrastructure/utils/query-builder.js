const bookshelfToDomainConverter = require('./bookshelf-to-domain-converter');
const { NotFoundError } = require('../../domain/errors');

module.exports = { get };

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
