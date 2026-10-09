import { knex as datamartKnex } from '../../../../../datamart/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationResult } from '../../domain/read-models/parcoursup/CertificationResult.js';
import { Competence } from '../../domain/read-models/parcoursup/Competence.js';

export async function getByINE({ ine }) {
  return _getBySearchParams({
    national_student_id: ine,
  });
}

export async function getByOrganizationUAI({ organizationUai, lastName, firstName, birthdate }) {
  return _getBySearchParams({
    organization_uai: organizationUai,
    last_name: lastName,
    first_name: firstName,
    birthdate,
  });
}

async function _getBySearchParams(searchParams) {
  const certificationResultDto = await datamartKnex('sco_certification_results')
    .select({
      ine: 'national_student_id',
      organizationUai: 'organization_uai',
      lastName: 'last_name',
      firstName: 'first_name',
      birthdate: 'birthdate',
      status: 'status',
      pixScore: 'pix_score',
      certificationDate: 'certification_date',
      certificationId: 'certification_courses_id',
      certificationCodeVerification: 'certification_code_verification',
      certificationIssuedAt: 'certification_issued_at',
      maxReachableLevel: 'max_reachable_level',
      maxReachablePixScore: 'max_reachable_pix_score',
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
      'certification_courses_id',
      'certification_code_verification',
      'certification_issued_at',
      'max_reachable_level',
      'max_reachable_pix_score',
    );

  if (!certificationResultDto.length) {
    throw new NotFoundError('No certifications found for given search parameters');
  }
  return toDomain(certificationResultDto);
}

export async function getByVerificationCode({ verificationCode }) {
  const certificationResultDto = await datamartKnex('certification_results')
    .select({
      lastName: 'last_name',
      firstName: 'first_name',
      birthdate: 'birthdate',
      status: 'status',
      pixScore: 'pix_score',
      certificationDate: 'certification_date',
      certificationId: 'certification_courses_id',
      certificationCodeVerification: 'certification_code_verification',
      certificationIssuedAt: 'certification_issued_at',
      maxReachableLevel: 'max_reachable_level',
      maxReachablePixScore: 'max_reachable_pix_score',
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
    .groupBy(
      'last_name',
      'first_name',
      'birthdate',
      'status',
      'pix_score',
      'certification_date',
      'certification_courses_id',
      'certification_code_verification',
      'certification_issued_at',
      'max_reachable_level',
      'max_reachable_pix_score',
    );

  if (!certificationResultDto.length) {
    throw new NotFoundError('No certifications found for given search parameters');
  }

  return toDomain(certificationResultDto);
}

/**
 * @returns {Array<CertificationResult>}
 */
function toDomain(certificationResultDto) {
  return certificationResultDto.map((certificationResult) => {
    const uniqCompetences = new Map();
    for (const competence of certificationResult.competences) {
      uniqCompetences.set(
        competence.competence_code,
        new Competence({
          code: competence.competence_code,
          name: competence.competence_name,
          areaName: competence.area_name,
          level: competence.competence_level,
        }),
      );
    }

    return new CertificationResult({
      ...certificationResult,
      certificationId: Number(certificationResult.certificationId),
      competences: Array.from(uniqCompetences.values()),
    });
  });
}
