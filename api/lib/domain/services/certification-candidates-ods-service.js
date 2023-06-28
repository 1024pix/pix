import * as readOdsUtils from '../../infrastructure/utils/ods/read-ods-utils.js';
import { getTransformationStructsForPixCertifCandidatesImport } from '../../infrastructure/files/candidates-import/candidates-import-transformation-structures.js';
import { CertificationCandidate } from '../../../src/certification/candidate/domain/models/CertificationCandidate.js';
import {
  CLEA,
  PIX_PLUS_DROIT,
  PIX_PLUS_EDU_1ER_DEGRE,
  PIX_PLUS_EDU_2ND_DEGRE,
} from '../models/ComplementaryCertification.js';
import { CertificationCandidatesImportError } from '../../../src/shared/domain/errors.js';
import _ from 'lodash';
import bluebird from 'bluebird';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../constants/certification-candidates-errors.js';

export { extractCertificationCandidatesFromCandidatesImportSheet };

async function extractCertificationCandidatesFromCandidatesImportSheet({
  i18n,
  sessionId,
  isSco,
  odsBuffer,
  certificationCpfService,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
  certificationCenterRepository,
}) {
  const translate = i18n.__;
  const certificationCenter = await certificationCenterRepository.getBySessionId(sessionId);
  const candidateImportStructs = getTransformationStructsForPixCertifCandidatesImport({
    i18n,
    complementaryCertifications: certificationCenter.habilitations,
    isSco,
  });
  try {
    await readOdsUtils.validateOdsHeaders({
      odsBuffer,
      headers: candidateImportStructs.headers,
    });
  } catch (err) {
    _handleVersionError();
  }
  const tableHeaderTargetPropertyMap = candidateImportStructs.transformStruct;
  let certificationCandidatesDataByLine = null;
  try {
    certificationCandidatesDataByLine = await readOdsUtils.extractTableDataFromOdsFile({
      odsBuffer,
      tableHeaderTargetPropertyMap,
    });
  } catch {
    _handleParsingError();
  }

  certificationCandidatesDataByLine = _filterOutEmptyCandidateData(certificationCandidatesDataByLine);

  return await bluebird.mapSeries(
    Object.entries(certificationCandidatesDataByLine),
    async ([line, certificationCandidateData]) => {
      let { sex, birthCountry, birthINSEECode, birthPostalCode, birthCity, billingMode } = certificationCandidateData;
      const { hasCleaNumerique, hasPixPlusDroit, hasPixPlusEdu1erDegre, hasPixPlusEdu2ndDegre } =
        certificationCandidateData;

      if (birthINSEECode && birthINSEECode !== '99' && birthINSEECode.length < 5)
        certificationCandidateData.birthINSEECode = `0${birthINSEECode}`;
      if (birthPostalCode && birthPostalCode.length < 5)
        certificationCandidateData.birthPostalCode = `0${birthPostalCode}`;

      if (certificationCandidateData.sex?.toUpperCase() === 'M') sex = 'M';
      if (certificationCandidateData.sex?.toUpperCase() === 'F') sex = 'F';

      const cpfBirthInformation = await certificationCpfService.getBirthInformation({
        ...certificationCandidateData,
        certificationCpfCityRepository,
        certificationCpfCountryRepository,
      });

      if (
        _hasMoreThanOneComplementarySubscription({
          hasCleaNumerique,
          hasPixPlusDroit,
          hasPixPlusEdu1erDegre,
          hasPixPlusEdu2ndDegre,
        })
      ) {
        line = parseInt(line) + 1;

        throw new CertificationCandidatesImportError({
          code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION.code,
          message: 'A candidate cannot have more than one complementary certification',
          meta: { line },
        });
      }

      if (cpfBirthInformation.hasFailed()) {
        _handleBirthInformationValidationError(cpfBirthInformation, line);
      }

      birthCountry = cpfBirthInformation.birthCountry;
      birthINSEECode = cpfBirthInformation.birthINSEECode;
      birthPostalCode = cpfBirthInformation.birthPostalCode;
      birthCity = cpfBirthInformation.birthCity;

      const complementaryCertification = await _buildComplementaryCertificationsForLine({
        hasCleaNumerique,
        hasPixPlusDroit,
        hasPixPlusEdu1erDegre,
        hasPixPlusEdu2ndDegre,
        complementaryCertificationRepository,
      });

      if (billingMode) {
        billingMode = CertificationCandidate.parseBillingMode({ billingMode, translate });
      }

      const certificationCandidate = new CertificationCandidate({
        ...certificationCandidateData,
        birthCountry,
        birthINSEECode,
        birthPostalCode,
        birthCity,
        sex,
        sessionId,
        complementaryCertification,
        billingMode,
      });

      try {
        certificationCandidate.validate(isSco);
      } catch (err) {
        _handleFieldValidationError(err, tableHeaderTargetPropertyMap, line);
      }

      return certificationCandidate;
    }
  );
}

function _hasMoreThanOneComplementarySubscription({
  hasCleaNumerique,
  hasPixPlusDroit,
  hasPixPlusEdu1erDegre,
  hasPixPlusEdu2ndDegre,
}) {
  const isTrueCount = [hasCleaNumerique, hasPixPlusDroit, hasPixPlusEdu1erDegre, hasPixPlusEdu2ndDegre].filter(
    (complementaryCertificationSubscription) => complementaryCertificationSubscription
  ).length;
  return isTrueCount > 1;
}

function _filterOutEmptyCandidateData(certificationCandidatesData) {
  return _(certificationCandidatesData)
    .mapValues(_nullifyObjectWithOnlyNilValues)
    .pickBy((value) => !_.isNull(value))
    .value();
}

function _nullifyObjectWithOnlyNilValues(data) {
  for (const propName in data) {
    if (!_.isNil(data[propName])) {
      return data;
    }
  }
  return null;
}

function _handleFieldValidationError(err, tableHeaderTargetPropertyMap, line) {
  const keyLabelMap = tableHeaderTargetPropertyMap.reduce((acc, obj) => {
    acc[obj.property] = obj.header;
    return acc;
  }, {});
  line = parseInt(line) + 1;
  throw CertificationCandidatesImportError.fromInvalidCertificationCandidateError(err, keyLabelMap, line);
}

function _handleBirthInformationValidationError(cpfBirthInformation, line) {
  line = parseInt(line) + 1;
  const { birthCountry, birthINSEECode, birthPostalCode, birthCity, firstErrorCode } = cpfBirthInformation;
  throw new CertificationCandidatesImportError({
    code: firstErrorCode,
    meta: { line, birthCountry, birthINSEECode, birthPostalCode, birthCity },
  });
}

function _handleVersionError() {
  throw new CertificationCandidatesImportError({
    code: 'INVALID_DOCUMENT',
    message: 'This version of the document is unknown.',
  });
}

function _handleParsingError() {
  throw new CertificationCandidatesImportError({ code: 'INVALID_DOCUMENT', message: 'Le document est invalide.' });
}

async function _buildComplementaryCertificationsForLine({
  hasCleaNumerique,
  hasPixPlusDroit,
  hasPixPlusEdu1erDegre,
  hasPixPlusEdu2ndDegre,
  complementaryCertificationRepository,
}) {
  const complementaryCertificationsInDB = await complementaryCertificationRepository.findAll();
  if (hasCleaNumerique) {
    return complementaryCertificationsInDB.find(
      (complementaryCertification) => complementaryCertification.key === CLEA
    );
  }
  if (hasPixPlusDroit) {
    return complementaryCertificationsInDB.find(
      (complementaryCertification) => complementaryCertification.key === PIX_PLUS_DROIT
    );
  }
  if (hasPixPlusEdu1erDegre) {
    return complementaryCertificationsInDB.find(
      (complementaryCertification) => complementaryCertification.key === PIX_PLUS_EDU_1ER_DEGRE
    );
  }
  if (hasPixPlusEdu2ndDegre) {
    return complementaryCertificationsInDB.find(
      (complementaryCertification) => complementaryCertification.key === PIX_PLUS_EDU_2ND_DEGRE
    );
  }
}
