import { Habilitation } from '../../../certification/enrolment/domain/models/Habilitation.js';
import { CERTIFICATION_FEATURES } from '../../../certification/shared/domain/constants.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { fetchPage } from '../../../shared/infrastructure/utils/knex-utils.js';
import { CertificationCenter } from '../../domain/models/CertificationCenter.js';

export async function getById({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const center = await knexConn
    .select({
      id: 'certification-centers.id',
      name: 'certification-centers.name',
      type: 'certification-centers.type',
      externalId: 'certification-centers.externalId',
      habilitations: knexConn.raw(
        `(SELECT json_agg(json_build_object(
        'complementaryCertificationId', cch."complementaryCertificationId",
        'key', cc."key",
        'label', cc."label"
          ) ORDER BY cch."complementaryCertificationId")
          FROM "complementary-certification-habilitations" cch
          JOIN "complementary-certifications" cc
            ON cch."complementaryCertificationId" = cc."id"
        WHERE cch."complementaryCertificationId" IS NOT NULL)`,
      ),
      features: knexConn.raw('array_remove(array_agg(DISTINCT "certificationCenterFeatures"."key"), NULL)'),
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
    .leftJoin(
      _getCertificationCenterFeatures({ id }),
      'certification-centers.id',
      'certificationCenterFeatures.certificationCenterId',
    )
    .leftJoin(
      function () {
        this.select('certificationCenterId')
          .from('certification-center-features')
          .innerJoin('features', function () {
            this.on('certification-center-features.featureId', 'features.id').andOnVal(
              'features.key',
              CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key,
            );
          })
          .as('complementaryCertificationAloneFeature');
      },
      'complementaryCertificationAloneFeature.certificationCenterId',
      'certification-centers.id',
    )
    .where('certification-centers.id', '=', id)
    .groupBy('certification-centers.id')
    .first();

  if (!center) {
    throw new NotFoundError('Center not found');
  }

  return _toDomain(center);
}

export const findPaginatedFiltered = async ({ filter, page }) => {
  const knexConnection = DomainTransaction.getConnection();
  const query = knexConnection('certification-centers')
    .select('*')
    .where((queryBuilder) => {
      _setSearchFiltersForQueryBuilder(filter, queryBuilder);
    })
    .orderBy('id');

  const { results: certificationCenters, pagination } = await fetchPage(query, page);

  return { models: certificationCenters.map(_toDomain), pagination };
};

function _getCertificationCenterFeatures({ id }) {
  return (builder) => {
    return builder
      .select('certification-center-features.certificationCenterId', 'features.key')
      .from('certification-center-features')
      .innerJoin('features', 'features.id', 'certification-center-features.featureId')
      .where('certification-center-features.certificationCenterId', '=', id)
      .as('certificationCenterFeatures');
  };
}

const _toDomain = (certificationCenter) => {
  const habilitations = certificationCenter?.habilitations
    ? certificationCenter.habilitations.map(
        (dbComplementaryCertification) => new Habilitation(dbComplementaryCertification),
      )
    : [];
  return new CertificationCenter({
    ...certificationCenter,
    habilitations,
  });
};

const _setSearchFiltersForQueryBuilder = (filters, queryBuilder) => {
  const { id, name, type, externalId } = filters;

  if (id) {
    queryBuilder.whereRaw('CAST(id as TEXT) LIKE ?', `%${id.toString().toLowerCase()}%`);
  }
  if (name) {
    queryBuilder.whereILike('name', `%${name}%`);
  }
  if (type) {
    queryBuilder.whereILike('type', `%${type}%`);
  }
  if (externalId) {
    queryBuilder.whereILike('externalId', `%${externalId}%`);
  }
};
