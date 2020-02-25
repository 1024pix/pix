const _ = require('lodash');

const BookshelfCertificationCenter = require('../data/certification-center');
const CertificationCenter = require('../../domain/models/CertificationCenter');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(bookshelfCertificationCenter) {
  const dbCertificationCenter = bookshelfCertificationCenter.toJSON();
  return new CertificationCenter(_.pick(dbCertificationCenter, [
    'id',
    'name',
    'type',
    'externalId',
    'createdAt',
  ]));
}

function _setSearchFiltersForQueryBuilder(filters, qb) {
  const { id, name, type, externalId } = filters;

  if (id) {
    qb.whereRaw('CAST(id as TEXT) LIKE ?', `%${id.toString().toLowerCase()}%`);
  }
  if (name) {
    qb.whereRaw('LOWER("name") LIKE ?', `%${name.toLowerCase()}%`);
  }
  if (type) {
    qb.whereRaw('LOWER("type") LIKE ?', `%${type.toLowerCase()}%`);
  }
  if (externalId) {
    qb.whereRaw('LOWER("externalId") LIKE ?', `%${externalId.toLowerCase()}%`);
  }
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

  findPaginatedFiltered({ filter, page }) {
    return BookshelfCertificationCenter
      .query((qb) => _setSearchFiltersForQueryBuilder(filter, qb))
      .fetchPage({
        page: page.number,
        pageSize: page.size
      })
      .then(({ models, pagination }) => ({
        models: models.map(_toDomain),
        pagination,
      }));
  },
};
