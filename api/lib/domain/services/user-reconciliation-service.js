import lodash from 'lodash';
import fp from 'lodash/fp.js';

const { pipe } = fp;
import randomString from 'randomstring';

import { LEVENSHTEIN_DISTANCE_MAX_RATE, STUDENT_RECONCILIATION_ERRORS } from '../../../src/shared/domain/constants.js';
import {
  AlreadyRegisteredUsernameError,
  NotFoundError,
  OrganizationLearnerAlreadyLinkedToInvalidUserError,
  OrganizationLearnerAlreadyLinkedToUserError,
} from '../../../src/shared/domain/errors.js';
import { areTwoStringsCloseEnough } from '../../../src/shared/domain/services/string-comparison-service.js';
import { isOneStringCloseEnoughFromMultipleStrings } from './string-comparison-service.js';
import { normalizeAndRemoveAccents, removeSpecialCharacters } from './validation-treatments.js';

const STRICT_MATCH_RATIO = 0;

function findMatchingCandidateIdForGivenUser(matchingUserCandidates, user) {
  const standardizedUser = _standardizeUser(user);
  const standardizedMatchingUserCandidates = lodash.map(matchingUserCandidates, _standardizeMatchingCandidate);

  const foundUserId = _findMatchingCandidateId(
    standardizedMatchingUserCandidates,
    standardizedUser,
    STRICT_MATCH_RATIO,
  );
  return (
    foundUserId ||
    _findMatchingCandidateId(standardizedMatchingUserCandidates, standardizedUser, LEVENSHTEIN_DISTANCE_MAX_RATE)
  );
}

async function findMatchingSupOrganizationLearnerIdForGivenOrganizationIdAndUser({
  organizationId,
  reconciliationInfo: { studentNumber, firstName, lastName, birthdate },
  supOrganizationLearnerRepository,
}) {
  const organizationLearner = await supOrganizationLearnerRepository.findOneByStudentNumberAndBirthdate({
    organizationId,
    studentNumber,
    birthdate,
  });

  if (!organizationLearner) {
    throw new NotFoundError('Found no organization learner matching organization, student number and birthdate');
  }

  const organizationLearnerId = findMatchingCandidateIdForGivenUser([organizationLearner], { firstName, lastName });
  if (!organizationLearnerId) {
    throw new NotFoundError('Found no organization learner matching organization and names');
  }

  if (!lodash.isNil(organizationLearner.userId)) {
    throw new OrganizationLearnerAlreadyLinkedToUserError();
  }
  return organizationLearner;
}

async function findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo({
  organizationId,
  reconciliationInfo: { firstName, lastName, birthdate },
  organizationLearnerRepository,
}) {
  const organizationLearners = await organizationLearnerRepository.findByOrganizationIdAndBirthdate({
    organizationId,
    birthdate,
  });

  if (lodash.isEmpty(organizationLearners)) {
    throw new NotFoundError('Found no organization learners matching organization and birthdate');
  }

  const organizationLearnerId = findMatchingCandidateIdForGivenUser(organizationLearners, { firstName, lastName });
  if (!organizationLearnerId) {
    throw new NotFoundError('Found no organization learner matching names');
  }

  return lodash.find(organizationLearners, { id: organizationLearnerId });
}

async function assertStudentHasAnAlreadyReconciledAccount(
  organizationLearner,
  userRepository,
  obfuscationService,
  studentRepository,
) {
  if (!lodash.isNil(organizationLearner.userId)) {
    await _buildStudentReconciliationError(
      organizationLearner.userId,
      'IN_SAME_ORGANIZATION',
      userRepository,
      obfuscationService,
    );
  }

  const student = await studentRepository.getReconciledStudentByNationalStudentId(
    organizationLearner.nationalStudentId,
  );
  if (lodash.get(student, 'account')) {
    await _buildStudentReconciliationError(
      student.account.userId,
      'IN_OTHER_ORGANIZATION',
      userRepository,
      obfuscationService,
    );
  }
}

async function _buildStudentReconciliationError(userId, errorContext, userRepository, obfuscationService) {
  const user = await userRepository.getForObfuscation(userId);
  let authenticationMethod;
  try {
    authenticationMethod = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);
  } catch (error) {
    throw new OrganizationLearnerAlreadyLinkedToInvalidUserError();
  }

  const detailWhenSameOrganization = 'Un compte existe déjà pour l‘élève dans le même établissement.';
  const detailWhenOtherOrganization = 'Un compte existe déjà pour l‘élève dans un autre établissement.';
  const detail = errorContext === 'IN_SAME_ORGANIZATION' ? detailWhenSameOrganization : detailWhenOtherOrganization;
  const error = STUDENT_RECONCILIATION_ERRORS.RECONCILIATION[errorContext][authenticationMethod.authenticatedBy];
  const meta = {
    shortCode: error.shortCode,
    value: authenticationMethod.value,
    userId: userId,
  };
  throw new OrganizationLearnerAlreadyLinkedToUserError(detail, error.code, meta);
}

function _containsOneElement(arr) {
  return lodash.size(arr) === 1;
}

function _standardizeUser(reconciliationInfo) {
  return lodash(reconciliationInfo).pick(['firstName', 'lastName']).mapValues(_standardize).value();
}

function _standardizeMatchingCandidate(matchingUserCandidate) {
  return lodash(matchingUserCandidate)
    .pick(['id', 'firstName', 'middleName', 'thirdName', 'lastName', 'preferredLastName'])
    .mapValues(_standardize)
    .value();
}

function _standardize(propToStandardize) {
  return lodash.isString(propToStandardize)
    ? pipe(normalizeAndRemoveAccents, removeSpecialCharacters)(propToStandardize)
    : propToStandardize;
}

function _findMatchingCandidateId(standardizedMatchingUserCandidates, standardizedUser, maxAcceptableRatio) {
  return (
    lodash(['firstName', 'middleName', 'thirdName'])
      .map(_findCandidatesMatchingWithUser(standardizedMatchingUserCandidates, standardizedUser, maxAcceptableRatio))
      .filter(_containsOneElement)
      .flatten()
      .map('id')
      .first() || null
  );
}

// A given name refers to either a first name, middle name or third name
function _findCandidatesMatchingWithUser(matchingUserCandidatesStandardized, standardizedUser, maxAcceptableRatio) {
  return (candidateGivenName) =>
    matchingUserCandidatesStandardized
      .filter(_candidateHasSimilarFirstName(standardizedUser, candidateGivenName, maxAcceptableRatio))
      .filter(_candidateHasSimilarLastName(standardizedUser, maxAcceptableRatio));
}

function _candidateHasSimilarFirstName(
  { firstName: userFirstName },
  candidateGivenName,
  maxAcceptableRatio = LEVENSHTEIN_DISTANCE_MAX_RATE,
) {
  return (candidate) =>
    candidate[candidateGivenName] &&
    areTwoStringsCloseEnough(userFirstName, candidate[candidateGivenName], maxAcceptableRatio);
}

function _candidateHasSimilarLastName({ lastName }, maxAcceptableRatio = LEVENSHTEIN_DISTANCE_MAX_RATE) {
  return (candidate) => {
    const candidatesLastName = [candidate.lastName, candidate.preferredLastName].filter(
      (candidateLastName) => candidateLastName,
    );
    return isOneStringCloseEnoughFromMultipleStrings(lastName, candidatesLastName, maxAcceptableRatio);
  };
}

// TODO Export all functions generating random codes to an appropriate service
const _generateCode = () => {
  return randomString.generate({ length: 4, charset: 'numeric' });
};

async function generateUsernameUntilAvailable({ firstPart, secondPart, userRepository }) {
  let randomPart = secondPart;

  let username;
  let isUsernameAvailable;

  do {
    username = firstPart + randomPart;
    isUsernameAvailable = true;

    try {
      await userRepository.isUsernameAvailable(username);
    } catch (error) {
      if (error instanceof AlreadyRegisteredUsernameError) {
        isUsernameAvailable = false;
        randomPart = _generateCode();
      } else {
        throw error;
      }
    }
  } while (!isUsernameAvailable);

  return username;
}

async function createUsernameByUser({ user: { firstName, lastName, birthdate }, userRepository }) {
  const standardizeUser = _standardizeUser({ firstName, lastName });
  const [, month, day] = birthdate.split('-');

  const firstPart = standardizeUser.firstName + '.' + standardizeUser.lastName;
  const secondPart = day + month;

  return await generateUsernameUntilAvailable({ firstPart, secondPart, userRepository });
}

export {
  assertStudentHasAnAlreadyReconciledAccount,
  createUsernameByUser,
  findMatchingCandidateIdForGivenUser,
  findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo,
  findMatchingSupOrganizationLearnerIdForGivenOrganizationIdAndUser,
  generateUsernameUntilAvailable,
};
