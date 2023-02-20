import _ from 'lodash';
import { pipe } from 'lodash/fp';
import randomString from 'randomstring';
import { STUDENT_RECONCILIATION_ERRORS } from '../constants';

import {
  AlreadyRegisteredUsernameError,
  NotFoundError,
  OrganizationLearnerAlreadyLinkedToUserError,
  OrganizationLearnerAlreadyLinkedToInvalidUserError,
} from '../errors';

import { areTwoStringsCloseEnough, isOneStringCloseEnoughFromMultipleStrings } from './string-comparison-service';
import { normalizeAndRemoveAccents, removeSpecialCharacters } from './validation-treatments';

const MAX_ACCEPTABLE_RATIO = 0.25;
const STRICT_MATCH_RATIO = 0;

function findMatchingCandidateIdForGivenUser(matchingUserCandidates, user) {
  const standardizedUser = _standardizeUser(user);
  const standardizedMatchingUserCandidates = _.map(matchingUserCandidates, _standardizeMatchingCandidate);

  const foundUserId = _findMatchingCandidateId(
    standardizedMatchingUserCandidates,
    standardizedUser,
    STRICT_MATCH_RATIO
  );
  return (
    foundUserId || _findMatchingCandidateId(standardizedMatchingUserCandidates, standardizedUser, MAX_ACCEPTABLE_RATIO)
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
    throw new NotFoundError('There are no organization learners found');
  }

  const organizationLearnerId = findMatchingCandidateIdForGivenUser([organizationLearner], { firstName, lastName });
  if (!organizationLearnerId) {
    throw new NotFoundError('There were no organizationLearners matching with names');
  }

  if (!_.isNil(organizationLearner.userId)) {
    throw new OrganizationLearnerAlreadyLinkedToUserError();
  }
  return organizationLearner;
}

async function findMatchingOrganizationLearnerIdForGivenOrganizationIdAndUser({
  organizationId,
  reconciliationInfo: { firstName, lastName, birthdate },
  organizationLearnerRepository,
}) {
  const organizationLearners = await organizationLearnerRepository.findByOrganizationIdAndBirthdate({
    organizationId,
    birthdate,
  });

  if (_.isEmpty(organizationLearners)) {
    throw new NotFoundError('There are no organization learners found');
  }

  const organizationLearnerId = findMatchingCandidateIdForGivenUser(organizationLearners, { firstName, lastName });
  if (!organizationLearnerId) {
    throw new NotFoundError('There were no organizationLearners matching with names');
  }

  return _.find(organizationLearners, { id: organizationLearnerId });
}

async function checkIfStudentHasAnAlreadyReconciledAccount(
  organizationLearner,
  userRepository,
  obfuscationService,
  studentRepository
) {
  if (!_.isNil(organizationLearner.userId)) {
    await _buildStudentReconciliationError(
      organizationLearner.userId,
      'IN_SAME_ORGANIZATION',
      userRepository,
      obfuscationService
    );
  }

  const student = await studentRepository.getReconciledStudentByNationalStudentId(
    organizationLearner.nationalStudentId
  );
  if (_.get(student, 'account')) {
    await _buildStudentReconciliationError(
      student.account.userId,
      'IN_OTHER_ORGANIZATION',
      userRepository,
      obfuscationService
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
  return _.size(arr) === 1;
}

function _standardizeUser(reconciliationInfo) {
  return _(reconciliationInfo).pick(['firstName', 'lastName']).mapValues(_standardize).value();
}

function _standardizeMatchingCandidate(matchingUserCandidate) {
  return _(matchingUserCandidate)
    .pick(['id', 'firstName', 'middleName', 'thirdName', 'lastName', 'preferredLastName'])
    .mapValues(_standardize)
    .value();
}

function _standardize(propToStandardize) {
  return _.isString(propToStandardize)
    ? pipe(normalizeAndRemoveAccents, removeSpecialCharacters)(propToStandardize)
    : propToStandardize;
}

function _findMatchingCandidateId(standardizedMatchingUserCandidates, standardizedUser, maxAcceptableRatio) {
  return (
    _(['firstName', 'middleName', 'thirdName'])
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
  maxAcceptableRatio = MAX_ACCEPTABLE_RATIO
) {
  return (candidate) =>
    candidate[candidateGivenName] &&
    areTwoStringsCloseEnough(userFirstName, candidate[candidateGivenName], maxAcceptableRatio);
}

function _candidateHasSimilarLastName({ lastName }, maxAcceptableRatio = MAX_ACCEPTABLE_RATIO) {
  return (candidate) => {
    const candidatesLastName = [candidate.lastName, candidate.preferredLastName].filter(
      (candidateLastName) => candidateLastName
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

export default {
  generateUsernameUntilAvailable,
  createUsernameByUser,
  findMatchingCandidateIdForGivenUser,
  findMatchingSupOrganizationLearnerIdForGivenOrganizationIdAndUser,
  findMatchingOrganizationLearnerIdForGivenOrganizationIdAndUser,
  checkIfStudentHasAnAlreadyReconciledAccount,
};
