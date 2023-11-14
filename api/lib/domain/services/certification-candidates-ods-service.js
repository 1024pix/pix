import * as readOdsUtils from '../../infrastructure/utils/ods/read-ods-utils.js';
import { getTransformationStructsForPixCertifCandidatesImport } from '../../infrastructure/files/candidates-import/candidates-import-transformation-structures.js';
import { CertificationCandidate } from '../models/CertificationCandidate.js';
import {
  CLEA,
  PIX_PLUS_DROIT,
  PIX_PLUS_EDU_1ER_DEGRE,
  PIX_PLUS_EDU_2ND_DEGRE,
} from '../models/ComplementaryCertification.js';
import { CertificationCandidatesError } from '../errors.js';
import _ from 'lodash';
import bluebird from 'bluebird';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../constants/certification-candidates-errors.js';
import * as mailCheckImplementation from '../../../src/shared/mail/infrastructure/services/mail-check.js';

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
  mailCheck = mailCheckImplementation,
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

  const _checkForDuplication = _handleDuplicateCandidate();
  return await bluebird.mapSeries(
    Object.entries(certificationCandidatesDataByLine),
    async ([line, certificationCandidateData]) => {
      let { sex, birthCountry, birthINSEECode, birthPostalCode, birthCity, billingMode } = certificationCandidateData;
      const { email, resultRecipientEmail } = certificationCandidateData;
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

        throw new CertificationCandidatesError({
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

      if (resultRecipientEmail) {
        try {
          await mailCheck.checkDomainIsValid(resultRecipientEmail);
        } catch {
          throw new CertificationCandidatesError({
            code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
            meta: { line, email: resultRecipientEmail },
          });
        }
      }

      if (email) {
        try {
          await mailCheck.checkDomainIsValid(email);
        } catch {
          throw new CertificationCandidatesError({
            code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EMAIL_NOT_VALID.code,
            meta: { line, email },
          });
        }
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
        _checkForDuplication(certificationCandidate);
      } catch (err) {
        throw new CertificationCandidatesError({
          code: err.code,
          meta: { line: parseInt(line) + 1 },
        });
      }

      return certificationCandidate;
    },
  );
}

function _hasMoreThanOneComplementarySubscription({
  hasCleaNumerique,
  hasPixPlusDroit,
  hasPixPlusEdu1erDegre,
  hasPixPlusEdu2ndDegre,
}) {
  const isTrueCount = [hasCleaNumerique, hasPixPlusDroit, hasPixPlusEdu1erDegre, hasPixPlusEdu2ndDegre].filter(
    (complementaryCertificationSubscription) => complementaryCertificationSubscription,
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

function _handleBirthInformationValidationError(cpfBirthInformation, line) {
  line = parseInt(line) + 1;
  const { birthCountry, birthINSEECode, birthPostalCode, birthCity, firstErrorCode } = cpfBirthInformation;
  throw new CertificationCandidatesError({
    code: firstErrorCode,
    meta: { line, birthCountry, birthINSEECode, birthPostalCode, birthCity },
  });
}

function _handleVersionError() {
  throw new CertificationCandidatesError({
    code: 'INVALID_DOCUMENT',
    message: 'This version of the document is unknown.',
  });
}

function _handleParsingError() {
  throw new CertificationCandidatesError({ code: 'INVALID_DOCUMENT', message: 'Le document est invalide.' });
}

function _handleDuplicateCandidate() {
  const candidateFootprints = new Set();
  return ({ firstName, lastName, birthdate }) => {
    const candidateInformationFootprint = firstName.toLowerCase() + lastName.toLowerCase() + birthdate;
    if (candidateFootprints.has(candidateInformationFootprint)) {
      throw new CertificationCandidatesError({
        code: 'DUPLICATE_CANDIDATE',
      });
    } else {
      candidateFootprints.add(candidateInformationFootprint);
    }
  };
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
      (complementaryCertification) => complementaryCertification.key === CLEA,
    );
  }
  if (hasPixPlusDroit) {
    return complementaryCertificationsInDB.find(
      (complementaryCertification) => complementaryCertification.key === PIX_PLUS_DROIT,
    );
  }
  if (hasPixPlusEdu1erDegre) {
    return complementaryCertificationsInDB.find(
      (complementaryCertification) => complementaryCertification.key === PIX_PLUS_EDU_1ER_DEGRE,
    );
  }
  if (hasPixPlusEdu2ndDegre) {
    return complementaryCertificationsInDB.find(
      (complementaryCertification) => complementaryCertification.key === PIX_PLUS_EDU_2ND_DEGRE,
    );
  }
}
