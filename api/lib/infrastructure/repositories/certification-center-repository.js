const _ = require('lodash');
const BookshelfCertificationCenter = require('../orm-models/CertificationCenter');
const CertificationCenter = require('../../domain/models/CertificationCenter');
const Accreditation = require('../../domain/models/Accreditation');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(bookshelfCertificationCenter) {
  const dbCertificationCenter = bookshelfCertificationCenter.toJSON();
  const accreditations = _.map(dbCertificationCenter.accreditations, (dbAccreditation) => {
    return new Accreditation({ id: dbAccreditation.id, name: dbAccreditation.name });
  });
  return new CertificationCenter({
    ..._.pick(dbCertificationCenter, ['id', 'name', 'type', 'externalId', 'createdAt']),
    accreditations,
  });
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
  async get(id) {
    const certificationCenterBookshelf = await BookshelfCertificationCenter.where({ id }).fetch({
      require: false,
      withRelated: [
        {
          accreditations: function (query) {
            query.orderBy('id');
          },
        },
      ],
    });

    if (certificationCenterBookshelf) {
      return _toDomain(certificationCenterBookshelf);
    }
    throw new NotFoundError(`Certification center with id: ${id} not found`);
  },

  async getBySessionId(sessionId) {
    const certificationCenterBookshelf = await BookshelfCertificationCenter.where({ 'sessions.id': sessionId })
      .query((qb) => {
        qb.innerJoin('sessions', 'sessions.certificationCenterId', 'certification-centers.id');
      })
      .fetch({
        require: false,
        withRelated: [
          {
            accreditations: function (query) {
              query.orderBy('id');
            },
          },
        ],
      });

    if (certificationCenterBookshelf) {
      return _toDomain(certificationCenterBookshelf);
    }
    throw new NotFoundError(`Could not find certification center for sessionId ${sessionId}.`);
  },

  async save(certificationCenter) {
    const cleanedCertificationCenter = _.omit(certificationCenter, ['createdAt', 'accreditations']);
    const certificationCenterBookshelf = await new BookshelfCertificationCenter(cleanedCertificationCenter).save();
    await certificationCenterBookshelf.related('accreditations').fetch();
    return _toDomain(certificationCenterBookshelf);
  },

  async findPaginatedFiltered({ filter, page }) {
    const certificationCenterBookshelf = await BookshelfCertificationCenter.query((qb) =>
      _setSearchFiltersForQueryBuilder(filter, qb)
    ).fetchPage({
      page: page.number,
      pageSize: page.size,
      withRelated: [
        {
          accreditations: function (query) {
            query.orderBy('id');
          },
        },
      ],
    });
    const { models, pagination } = certificationCenterBookshelf;
    return { models: models.map(_toDomain), pagination };
  },

  async findByExternalId({ externalId }) {
    const certificationCenterBookshelf = await BookshelfCertificationCenter.where({ externalId }).fetch({
      require: false,
      withRelated: [
        {
          accreditations: function (query) {
            query.orderBy('id');
          },
        },
      ],
    });

    return certificationCenterBookshelf ? _toDomain(certificationCenterBookshelf) : null;
  },
};
