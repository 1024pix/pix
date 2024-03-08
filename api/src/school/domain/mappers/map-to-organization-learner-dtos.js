import { OrganizationLearnerDTO } from '../read-models/OrganizationLearnerDTO.js';

function displayableLastNamePostfix(lastName, nbOfLettersToKeep) {
  const keepAllLastNameLetters = nbOfLettersToKeep === lastName.length;
  if (keepAllLastNameLetters) {
    return ` ${lastName}`;
  }
  return ` ${lastName.substring(0, nbOfLettersToKeep)}.`;
}

function shortestLastNamePostfix(lastName, otherLastNames) {
  let nbOfLettersToKeep = 1;
  const lastNameLength = lastName.length;
  while (
    otherLastNames.some((otherLastName) => otherLastName.startsWith(lastName.substring(0, nbOfLettersToKeep))) &&
    nbOfLettersToKeep < lastNameLength
  ) {
    nbOfLettersToKeep++;
  }
  return displayableLastNamePostfix(lastName, nbOfLettersToKeep);
}

/**
 * Computes a string from learner's last name to identify him/her from the other learners of a division.
 * @param learner
 * @param learners all the learners (including given learner)
 * @returns {string} lastNamePostfix as empty string if learner has unique first name in the division or the shortest
 * part of the last name as possible otherwise.
 */
function getDistinctiveLastNamePostfix(learner, learners) {
  const otherLearnersWithSameFirstNameAndDivision = learners.filter(
    (otherLearner) =>
      otherLearner !== learner &&
      otherLearner.firstName === learner.firstName &&
      otherLearner.division === learner.division,
  );
  if (otherLearnersWithSameFirstNameAndDivision.length > 0) {
    return shortestLastNamePostfix(
      learner.lastName,
      otherLearnersWithSameFirstNameAndDivision.map((otherLearner) => otherLearner.lastName),
    );
  }
  return '';
}

export function mapToOrganizationLearnerDtos(learners) {
  return learners.map((learner) => {
    const lastNamePostfix = getDistinctiveLastNamePostfix(learner, learners);
    const displayName = `${learner.firstName}${lastNamePostfix}`;
    return new OrganizationLearnerDTO({ ...learner, displayName });
  });
}
