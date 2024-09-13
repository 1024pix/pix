import { ComplementaryCertification } from '../../../certification/complementary-certification/domain/models/ComplementaryCertification.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { CertificationCenter } from '../../../shared/domain/models/index.js';
import { fetchPage } from '../../../shared/infrastructure/utils/knex-utils.js';

const toDomain = (certificationCenter) => {
  const habilitations = certificationCenter.habilitations.map(
    (dbComplementaryCertification) => new ComplementaryCertification(dbComplementaryCertification),
  );
  return new CertificationCenter({
    ...certificationCenter,
    habilitations,
  });
};

const setSearchFiltersForQueryBuilder = (filters, queryBuilder) => {
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

export const findPaginatedFiltered = async ({ filter, page }) => {
  const knexConnection = DomainTransaction.getConnection();
  const query = knexConnection('certification-centers')
    .select('*')
    .where((queryBuilder) => {
      setSearchFiltersForQueryBuilder(filter, queryBuilder);
    })
    .orderBy('id');

  const { results: certificationCenters, pagination } = await fetchPage(query, page);

  const certificationCenterIds = certificationCenters.map(({ id }) => id);
  const habilitations = await knexConnection('complementary-certification-habilitations')
    .select('*')
    .whereIn('certificationCenterId', certificationCenterIds);
  const complementaryCertificationsIds = habilitations.map(
    ({ complementaryCertificationId }) => complementaryCertificationId,
  );
  const complementaryCertifications = await knexConnection('complementary-certifications')
    .select('*')
    .orderBy('id')
    .whereIn('id', complementaryCertificationsIds);

  const certificationCentersWithComplementaryCertification = certificationCenters.map((certificationCenter) => {
    const certificationCenterHabilitations = habilitations.filter(
      (habilitation) => habilitation.certificationCenterId === certificationCenter.id,
    );
    const certificationCenterComplementaryCertificationsIds = certificationCenterHabilitations.map(
      ({ complementaryCertificationId }) => complementaryCertificationId,
    );
    const certificationCenterComplementaryCertifications = complementaryCertifications.filter(({ id }) =>
      certificationCenterComplementaryCertificationsIds.includes(id),
    );

    return {
      ...certificationCenter,
      habilitations: certificationCenterComplementaryCertifications,
    };
  });

  return { models: certificationCentersWithComplementaryCertification.map(toDomain), pagination };
};
