import { datamartKnex } from '../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { CertificationResult } from '../../domain/read-models/CertificationResult.js';

const getByINE = async ({ ine }) => {
  return _getBySearchParams({
    national_student_id: ine,
  });
};

const getByOrganizationUAI = async ({ organizationUai, lastName, firstName, birthdate }) => {
  return _getBySearchParams({
    organization_uai: organizationUai,
    last_name: lastName,
    first_name: firstName,
    birthdate,
  });
};

const _getBySearchParams = async (searchParams) => {
  const certificationResultDto = await datamartKnex('data_export_parcoursup_certif_result')
    .select({
      national_student_id: 'national_student_id',
      organization_uai: 'organization_uai',
      last_name: 'last_name',
      first_name: 'first_name',
      birthdate: 'birthdate',
      status: 'status',
      pix_score: 'pix_score',
      certification_date: 'certification_date',
      competences: datamartKnex.raw(
        `json_agg(json_build_object(
          'competence_code', "competence_code",
          'competence_name', "competence_name",
          'area_name', "area_name",
          'competence_level', "competence_level"
        ))`,
      ),
    })
    .where(searchParams)
    .groupBy(
      'national_student_id',
      'organization_uai',
      'last_name',
      'first_name',
      'birthdate',
      'status',
      'pix_score',
      'certification_date',
    );

  if (!certificationResultDto.length) {
    throw new NotFoundError('No certifications found for given search parameters');
  }

  return _toDomain(certificationResultDto);
};

const getByVerificationCode = async ({ verificationCode }) => {
  const certificationResultDto = await datamartKnex('data_export_parcoursup_certif_result_code_validation')
    .select({
      last_name: 'last_name',
      first_name: 'first_name',
      birthdate: 'birthdate',
      status: 'status',
      pix_score: 'pix_score',
      certification_date: 'certification_date',
      competences: datamartKnex.raw(
        `json_agg(json_build_object(
          'competence_code', "competence_code",
          'competence_name', "competence_name",
          'area_name', "area_name",
          'competence_level', "competence_level"
        ))`,
      ),
    })
    .where({
      certification_code_verification: verificationCode,
    })
    .groupBy('last_name', 'first_name', 'birthdate', 'status', 'pix_score', 'certification_date');

  if (!certificationResultDto.length) {
    throw new NotFoundError('No certifications found for given search parameters');
  }

  return _toDomain(certificationResultDto);
};

/**
 * @returns {Array<CertificationResult>}
 */
const _toDomain = (certificationResultDto) => {
  return certificationResultDto.map((certificationResult) => {
    return new CertificationResult({
      ine: certificationResult.national_student_id,
      organizationUai: certificationResult.organization_uai,
      lastName: certificationResult.last_name,
      firstName: certificationResult.first_name,
      birthdate: certificationResult.birthdate,
      status: certificationResult.status,
      pixScore: certificationResult.pix_score,
      certificationDate: certificationResult.certification_date,
      competences: certificationResult.competences.map((competence) => {
        return {
          code: competence.competence_code,
          name: competence.competence_name,
          areaName: competence.area_name,
          level: competence.competence_level,
        };
      }),
    });
  });
};

export { getByINE, getByOrganizationUAI, getByVerificationCode };
