const _ = require('lodash');
const BookshelfCertificationCenter = require('../orm-models/CertificationCenter.js');
const { knex } = require('../../../db/knex-database-connection.js');
const CertificationCenter = require('../../domain/models/CertificationCenter.js');
const ComplementaryCertification = require('../../domain/models/ComplementaryCertification.js');
const { NotFoundError } = require('../../domain/errors.js');

function _toDomain(bookshelfCertificationCenter) {
  const dbCertificationCenter = bookshelfCertificationCenter.toJSON();
  const habilitations = _.map(dbCertificationCenter.habilitations, (dbComplementaryCertification) => {
    return new ComplementaryCertification({
      id: dbComplementaryCertification.id,
      key: dbComplementaryCertification.key,
      label: dbComplementaryCertification.label,
    });
  });
  return new CertificationCenter({
    ..._.pick(dbCertificationCenter, ['id', 'name', 'type', 'externalId', 'createdAt', 'updatedAt']),
    habilitations,
  });
}

function _setSearchFiltersForQueryBuilder(filters, qb) {
  const { id, name, type, externalId } = filters;

  if (id) {
    qb.whereRaw('CAST(id as TEXT) LIKE ?', `%${id.toString().toLowerCase()}%`);
  }
  if (name) {
    qb.whereILike('name', `%${name}%`);
  }
  if (type) {
    qb.whereILike('type', `%${type}%`);
  }
  if (externalId) {
    qb.whereILike('externalId', `%${externalId}%`);
  }
}

module.exports = {
  async get(id) {
    const certificationCenterBookshelf = await BookshelfCertificationCenter.query((q) => q.orderBy('id', 'desc'))
      .where({ id })
      .fetch({
        require: false,
        withRelated: [
          {
            habilitations: function (query) {
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
            habilitations: function (query) {
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
    const cleanedCertificationCenter = _.omit(certificationCenter, ['createdAt', 'habilitations']);
    const certificationCenterBookshelf = await new BookshelfCertificationCenter(cleanedCertificationCenter).save();
    await certificationCenterBookshelf.related('habilitations').fetch();
    return _toDomain(certificationCenterBookshelf);
  },

  async findPaginatedFiltered({ filter, page }) {
    const certificationCenterBookshelf = await BookshelfCertificationCenter.query((qb) => {
      _setSearchFiltersForQueryBuilder(filter, qb);
      qb.orderBy('id');
    }).fetchPage({
      page: page.number,
      pageSize: page.size,
      withRelated: [
        {
          habilitations: function (query) {
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
          habilitations: function (query) {
            query.orderBy('id');
          },
        },
      ],
    });

    return certificationCenterBookshelf ? _toDomain(certificationCenterBookshelf) : null;
  },

  async getRefererEmails(certificationCenterId) {
    const refererEmails = await knex('certification-centers')
      .select('users.email')
      .join(
        'certification-center-memberships',
        'certification-center-memberships.certificationCenterId',
        'certification-centers.id'
      )
      .join('users', 'users.id', 'certification-center-memberships.userId')
      .where('certification-centers.id', certificationCenterId)
      .where('certification-center-memberships.isReferer', true);

    return refererEmails;
  },
};
