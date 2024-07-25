import _ from 'lodash';

import { BookshelfCertificationCenter } from '../../../../lib/infrastructure/orm-models/CertificationCenter.js';
import { ComplementaryCertification } from '../../../certification/complementary-certification/domain/models/ComplementaryCertification.js';
import { CertificationCenter } from '../../../shared/domain/models/index.js';

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
    ..._.pick(dbCertificationCenter, ['id', 'name', 'type', 'externalId', 'createdAt', 'updatedAt', 'isV3Pilot']),
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

const findPaginatedFiltered = async function ({ filter, page }) {
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
};

export { findPaginatedFiltered };
