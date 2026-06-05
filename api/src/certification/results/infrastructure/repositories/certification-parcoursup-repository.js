import { knex as datamartKnex } from '../../../../../datamart/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CORE_MESH_CONFIGURATION } from '../../../shared/domain/constants/mesh-configuration.js';
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
      scoring_configuration: 'configuration',
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
      'configuration',
    );

  if (!certificationResultDto.length) {
    throw new NotFoundError('No certifications found for given search parameters');
  }

  return _toDomain(certificationResultDto);
}

export async function getByVerificationCode({ verificationCode }) {
  const certificationResultDto = await datamartKnex('certification_results')
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
      scoring_configuration: 'configuration',
    })
    .where({
      certification_code_verification: verificationCode,
    })
    .groupBy('last_name', 'first_name', 'birthdate', 'status', 'pix_score', 'certification_date', 'configuration');

  if (!certificationResultDto.length) {
    throw new NotFoundError('No certifications found for given search parameters');
  }

  return _toDomain(certificationResultDto);
}

/**
 * @returns {Array<CertificationResult>}
 */
function _toDomain(certificationResultDto) {
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
      ine: certificationResult.national_student_id,
      organizationUai: certificationResult.organization_uai,
      lastName: certificationResult.last_name,
      firstName: certificationResult.first_name,
      birthdate: certificationResult.birthdate,
      status: certificationResult.status,
      pixScore: certificationResult.pix_score,
      certificationDate: certificationResult.certification_date,
      competences: Array.from(uniqCompetences.values()),
      maxReachableLevel: _getMaxReachableLevel(
        certificationResult.scoring_configuration,
        certificationResult.national_student_id,
      ),
    });
  });
}

function _getMaxReachableLevel(scoringConfiguration, ine) {
  if (!scoringConfiguration) {
    logger.trace(
      { ine },
      'Missing scoring_configuration in certification result, using MESH_CONFIGURATION as fallback',
    );
    const lastMesh = [...CORE_MESH_CONFIGURATION.values()].at(-1);
    return lastMesh.coefficient;
  }
  return scoringConfiguration.length - 1;
}
