const _ = require('lodash');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfCertificationCenter = require('../data/certification-center');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  get(id) {
    return BookshelfCertificationCenter
      .where({ id })
      .fetch()
      .then((certificationCenter) => {
        if (certificationCenter) {
          return bookshelfToDomainConverter.buildDomainObject(BookshelfCertificationCenter, certificationCenter);
        }
        throw new NotFoundError(`Certification center with id: ${id} not found`);
      });
  },

  save(certificationCenter) {
    const cleanedCertificationCenter = _.omit(certificationCenter, ['createdAt']);
    return new BookshelfCertificationCenter(cleanedCertificationCenter)
      .save()
      .then((savedCertificationCenter) => bookshelfToDomainConverter.buildDomainObject(
        BookshelfCertificationCenter, savedCertificationCenter
      ));
  },

  find() {
    return BookshelfCertificationCenter
      .fetchAll()
      .then((certificationCenters) => bookshelfToDomainConverter.buildDomainObjects(
        BookshelfCertificationCenter, certificationCenters.models
      ));
  }
};
