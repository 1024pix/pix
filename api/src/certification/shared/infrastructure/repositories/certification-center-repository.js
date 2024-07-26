import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { BookshelfCertificationCenter } from '../../../../../src/shared/infrastructure/orm-models/CertificationCenter.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationCenter } from '../../../../shared/domain/models/CertificationCenter.js';
import { ComplementaryCertification } from '../../../complementary-certification/domain/models/ComplementaryCertification.js';

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

/**
 *@deprecated implemented without bookshelf in {@link file://./../../../session-management/infrastructure/repositories/center-repository.js}
 * note that the new implementations does not provide the lazy loading on habilitations
 */
const get = async function ({ id }) {
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
};

const getBySessionId = async function ({ sessionId }) {
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
};

// @deprecated
const save = async function ({ certificationCenter }) {
  const cleanedCertificationCenter = _.omit(certificationCenter, ['createdAt', 'habilitations']);
  const certificationCenterBookshelf = await new BookshelfCertificationCenter(cleanedCertificationCenter).save();
  await certificationCenterBookshelf.related('habilitations').fetch();
  return _toDomain(certificationCenterBookshelf);
};

const findByExternalId = async function ({ externalId }) {
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
};

const getRefererEmails = async function ({ id }) {
  const refererEmails = await knex('certification-centers')
    .select('users.email')
    .join(
      'certification-center-memberships',
      'certification-center-memberships.certificationCenterId',
      'certification-centers.id',
    )
    .join('users', 'users.id', 'certification-center-memberships.userId')
    .where('certification-centers.id', id)
    .where('certification-center-memberships.isReferer', true);

  return refererEmails;
};

export { findByExternalId, get, getBySessionId, getRefererEmails, save };
