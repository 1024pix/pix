const _ = require('lodash');

const BookshelfCertificationCenter = require('../data/certification-center');
const CertificationCenter = require('../../domain/models/CertificationCenter');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(bookshelfCertificationCenter) {
  const dbCertificationCenter = bookshelfCertificationCenter.toJSON();
  return new CertificationCenter(_.pick(dbCertificationCenter, [
    'id',
    'name',
    'externalId',
    'createdAt',
  ]));
}

module.exports = {

  get(id) {
    return BookshelfCertificationCenter
      .where({ id })
      .fetch()
      .then((certificationCenter) => {
        if (certificationCenter) {
          return _toDomain(certificationCenter);
        }
        throw new NotFoundError(`Certification center with id: ${id} not found`);
      });
  },

  save(certificationCenter) {
    const cleanedCertificationCenter = _.omit(certificationCenter, ['createdAt']);
    return new BookshelfCertificationCenter(cleanedCertificationCenter)
      .save()
      .then(_toDomain);
  },

  find() {
    return BookshelfCertificationCenter
      .fetchAll()
      .then((certificationCenters) => certificationCenters.models.map(_toDomain));
  }
};
