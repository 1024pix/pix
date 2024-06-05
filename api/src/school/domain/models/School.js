import { OrganizationLearnerDTO } from '../read-models/OrganizationLearnerDTO.js';

class School {
  #organizationLearners;

  constructor({ id, name, code, organizationLearners } = {}) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.#organizationLearners = organizationLearners;
  }

  get organizationLearners() {
    return this.#redactPrivateData();
  }

  #redactPrivateData() {
    return this.#organizationLearners.map((learner) => {
      const lastNamePostfix = this.#getDistinctiveLastNamePostfix(learner);
      const displayName = `${learner.firstName}${lastNamePostfix}`;
      return new OrganizationLearnerDTO({ ...learner, displayName });
    });
  }

  #displayableLastNamePostfix(lastName, nbOfLettersToKeep) {
    const keepAllLastNameLetters = nbOfLettersToKeep === lastName.length;
    if (keepAllLastNameLetters) {
      return ` ${lastName}`;
    }
    return ` ${lastName.substring(0, nbOfLettersToKeep)}.`;
  }

  #shortestLastNamePostfix(lastName, otherLastNames) {
    let nbOfLettersToKeep = 1;
    const lastNameLength = lastName.length;
    const normalizedLastName = lastName.toLowerCase();
    const normalizedOtherLastNames = otherLastNames.map((s) => s.toLowerCase());
    while (
      normalizedOtherLastNames.some((otherLastName) =>
        otherLastName.startsWith(normalizedLastName.substring(0, nbOfLettersToKeep)),
      ) &&
      nbOfLettersToKeep < lastNameLength
    ) {
      nbOfLettersToKeep++;
    }
    return this.#displayableLastNamePostfix(lastName, nbOfLettersToKeep);
  }

  /**
   * Computes a string from learner's last name to identify him/her from the other learners of a division.
   * @param learner
   * @returns {string} lastNamePostfix as empty string if learner has unique first name in the division or the shortest
   * part of the last name as possible otherwise.
   */
  #getDistinctiveLastNamePostfix(learner) {
    const otherLearnersWithSameFirstNameAndDivision = this.#organizationLearners.filter(
      (otherLearner) =>
        otherLearner !== learner &&
        otherLearner.firstName.toLowerCase() === learner.firstName.toLowerCase() &&
        otherLearner.division === learner.division,
    );
    if (otherLearnersWithSameFirstNameAndDivision.length === 0) {
      return '';
    }
    return this.#shortestLastNamePostfix(
      learner.lastName,
      otherLearnersWithSameFirstNameAndDivision.map((otherLearner) => otherLearner.lastName),
    );
  }
}

export { School };
