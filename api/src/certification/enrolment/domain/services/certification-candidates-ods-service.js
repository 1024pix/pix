import { CertificationCandidatesError } from '../../../../shared/domain/errors.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { mailCheck as mailCheckImplementation } from '../../../../shared/mail/infrastructure/services/mail-check.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../shared/domain/constants/certification-candidates-errors.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import { getTransformationStructsForPixCertifCandidatesImport } from '../../infrastructure/candidates-import/candidates-import-transformation-structures.js';
import * as readOdsUtils from '../../infrastructure/utils/ods/read-ods-utils.js';
import { Candidate } from '../models/Candidate.js';

export async function extractCertificationCandidatesFromCandidatesImportSheet({
  i18n,
  session,
  isSco,
  odsBuffer,
  certificationCpfService,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  centerRepository,
  mailCheck = mailCheckImplementation,
}) {
  const translate = i18n.__;
  const center = await centerRepository.getById({ id: session.certificationCenterId });
  const candidateImportStructs = getTransformationStructsForPixCertifCandidatesImport({
    i18n,
    habilitations: center.habilitations,
    isSco,
  });
  try {
    await readOdsUtils.validateOdsHeaders({
      odsBuffer,
      headers: candidateImportStructs.headers,
    });
  } catch {
    _handleVersionError();
  }
  const tableHeaderTargetPropertyMap = candidateImportStructs.transformStruct;
  let candidatesDataByLine = null;
  try {
    candidatesDataByLine = await readOdsUtils.extractTableDataFromOdsFile({
      odsBuffer,
      tableHeaderTargetPropertyMap,
    });
  } catch {
    _handleParsingError();
  }

  candidatesDataByLine = _filterOutEmptyCandidateData(candidatesDataByLine);

  if (Object.keys(candidatesDataByLine).length === 0) {
    throw new CertificationCandidatesError({
      code: CERTIFICATION_CANDIDATES_ERRORS.EMPTY_CANDIDATES_IMPORT.code,
    });
  }

  const _checkForDuplication = _handleDuplicateCandidate();

  return PromiseUtils.mapSeries(Object.entries(candidatesDataByLine), async ([line, candidateData]) => {
    let { sex, birthCountry, birthINSEECode, birthPostalCode, birthCity, billingMode } = candidateData;
    const { email, resultRecipientEmail } = candidateData;

    if (birthINSEECode && birthINSEECode !== '99' && birthINSEECode.length < 5)
      candidateData.birthINSEECode = `0${birthINSEECode}`;
    if (birthPostalCode && birthPostalCode.length < 5) candidateData.birthPostalCode = `0${birthPostalCode}`;

    if (candidateData.sex?.toUpperCase() === 'M') sex = 'M';
    if (candidateData.sex?.toUpperCase() === 'F') sex = 'F';

    const cpfBirthInformation = await certificationCpfService.getBirthInformation({
      ...candidateData,
      certificationCpfCityRepository,
      certificationCpfCountryRepository,
    });

    const subscription = _buildSubscription(candidateData);

    if (cpfBirthInformation.hasFailed()) {
      _handleBirthInformationValidationError(cpfBirthInformation, line);
    }

    birthCountry = cpfBirthInformation.birthCountry;
    birthINSEECode = cpfBirthInformation.birthINSEECode;
    birthPostalCode = cpfBirthInformation.birthPostalCode;
    birthCity = cpfBirthInformation.birthCity;

    if (billingMode) {
      billingMode = Candidate.parseBillingMode({ billingMode, translate });
    }

    if (resultRecipientEmail) {
      try {
        await mailCheck.assertEmailDomainHasMx(resultRecipientEmail);
      } catch {
        throw new CertificationCandidatesError({
          code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
          meta: { line, value: resultRecipientEmail },
        });
      }
    }

    if (email) {
      try {
        await mailCheck.assertEmailDomainHasMx(email);
      } catch {
        throw new CertificationCandidatesError({
          code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EMAIL_NOT_VALID.code,
          meta: { line, value: email },
        });
      }
    }

    const candidate = new Candidate({
      ...candidateData,
      birthCountry,
      birthINSEECode,
      birthPostalCode,
      birthCity,
      sex,
      sessionId: session.id,
      billingMode: billingMode ?? null,
      prepaymentCode: candidateData.prepaymentCode ?? null,
      subscription,
      id: null,
      birthProvinceCode: null,
      createdAt: null,
      organizationLearnerId: null,
      userId: null,
    });

    try {
      candidate.validate({ isSco });
      _checkForDuplication(candidate);
    } catch (error) {
      if (error?.code?.includes('subscriptions')) {
        throw new CertificationCandidatesError({
          code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION.code,
          message: 'A candidate cannot have more than one complementary certification',
          meta: { line },
        });
      }
      throw new CertificationCandidatesError({
        code: error.code,
        meta: { line: parseInt(line) + 1, value: error.meta },
      });
    }

    return candidate;
  });
}

function _filterOutEmptyCandidateData(certificationCandidatesData) {
  const filteredData = {};
  Object.keys(certificationCandidatesData).forEach((certificationCandidateId) => {
    const certificationCandidateData = certificationCandidatesData[certificationCandidateId];
    const values = Object.values(certificationCandidateData);
    if (values.filter(Boolean).length !== 0) {
      filteredData[certificationCandidateId] = certificationCandidateData;
    }
  });
  return filteredData;
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

function _buildSubscription(candidateData) {
  const selectedFrameworks = Object.values(Frameworks)
    .filter((key) => key !== Frameworks.CORE)
    .filter((key) => Boolean(candidateData[key]));
  if (selectedFrameworks.length > 1) {
    throw new CertificationCandidatesError({
      code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION.code,
      message: 'A candidate cannot have more than one complementary certification',
    });
  }
  return selectedFrameworks[0] || Frameworks.CORE;
}
