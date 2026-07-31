import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { fetchPage } from '../../../shared/infrastructure/utils/knex-utils.js';
import { CertificationCenter } from '../../domain/models/CertificationCenter.js';
import { Habilitation } from '../../domain/models/Habilitation.js';

export async function getById({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const certificationCenter = await knexConn
    .select({
      id: 'certification-centers.id',
      name: 'certification-centers.name',
      type: 'certification-centers.type',
      externalId: 'certification-centers.externalId',
      createdAt: 'certification-centers.createdAt',
      updatedAt: 'certification-centers.updatedAt',
      archivedAt: 'certification-centers.archivedAt',
      archivedBy: 'certification-centers.archivedBy',
    })
    .from('certification-centers')
    .leftJoin(
      'complementary-certification-habilitations',
      'certification-centers.id',
      'complementary-certification-habilitations.certificationCenterId',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certification-habilitations.complementaryCertificationId',
      'complementary-certifications.id',
    )
    .where('certification-centers.id', '=', id)
    .groupBy('certification-centers.id')
    .first();

  if (!certificationCenter) {
    throw new NotFoundError('Center not found');
  }

  const habilitationsDTO = await knexConn('complementary-certifications')
    .select([
      'complementary-certifications.id',
      'complementary-certifications.key',
      'complementary-certifications.label',
    ])
    .join(
      'complementary-certification-habilitations',
      'complementary-certification-habilitations.complementaryCertificationId',
      'complementary-certifications.id',
    )
    .where('complementary-certification-habilitations.certificationCenterId', certificationCenter.id)
    .orderBy('complementary-certifications.id');

  return _toDomain({ certificationCenter, habilitationsDTO });
}

export const findPaginatedFiltered = async ({ filter, page }) => {
  const knexConnection = DomainTransaction.getConnection();
  const query = knexConnection('certification-centers')
    .select('*')
    .where((queryBuilder) => {
      _setSearchFiltersForQueryBuilder(filter, queryBuilder);
    })
    .orderBy('id');

  const { results: certificationCenters, pagination } = await fetchPage({
    queryBuilder: query,
    paginationParams: page,
  });

  return { models: certificationCenters.map((certificationCenter) => _toDomain({ certificationCenter })), pagination };
};

const _toDomain = ({ certificationCenter, habilitationsDTO }) => {
  const habilitations = habilitationsDTO
    ? habilitationsDTO.map(
        (habilitationDTO) => new Habilitation({ complementaryCertificationId: habilitationDTO.id, ...habilitationDTO }),
      )
    : [];
  return new CertificationCenter({
    ...certificationCenter,
    habilitations,
  });
};

const _setSearchFiltersForQueryBuilder = (filters, queryBuilder) => {
  const { id, name, type, externalId, hideArchived } = filters;

  if (id) {
    queryBuilder.whereRaw('CAST(id as TEXT) LIKE ?', `%${id.toString().toLowerCase()}%`);
  }
  if (name) {
    queryBuilder.whereRaw(
      `
      regexp_replace(unaccent(name), '[^[:alnum:]]', '', 'g')
      ILIKE
      '%' || regexp_replace(unaccent(?), '[^[:alnum:]]', '', 'g') || '%'
      `,
      [name],
    );
  }
  if (type) {
    queryBuilder.whereILike('type', `%${type}%`);
  }
  if (externalId) {
    queryBuilder.whereILike('externalId', `%${externalId}%`);
  }
  if (hideArchived) {
    queryBuilder.whereNull('archivedAt');
  }
};
