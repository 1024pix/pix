import dayjs from 'dayjs';
import lodash from 'lodash';

import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../shared/domain/constants.js';

const { isNil } = lodash;

/**
 * @typedef {Object} CertificationCandidateForSupervising
 * @property {number} id
 * @property {number} userId
 * @property {string} firstName
 * @property {string} lastName
 * @property {date} birthdate
 * @property {number} extraTimePercentage
 * @property {boolean} authorizedToStart
 * @property {date} startDateTime
 * @property {date} theoricalEndDateTime
 * @property {ComplementaryCertification} enrolledComplementaryCertification
 * @property {boolean} isComplementaryCertificationInProgress
 */
class CertificationCandidateForSupervising {
  constructor({
    id,
    userId,
    firstName,
    lastName,
    birthdate,
    extraTimePercentage,
    authorizedToStart,
    assessmentStatus,
    startDateTime,
    enrolledComplementaryCertification,
    isComplementaryCertificationInProgress,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.extraTimePercentage = !isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : extraTimePercentage;
    this.authorizedToStart = !!authorizedToStart;
    this.assessmentStatus = assessmentStatus;
    this.startDateTime = startDateTime;
    this.enrolledComplementaryCertification = enrolledComplementaryCertification;
    this.isComplementaryCertificationInProgress = !!isComplementaryCertificationInProgress;
    this.theoricalEndDateTime = this.#computeTheoricalEndDateTime();
  }

  authorizeToStart() {
    this.authorizedToStart = true;
  }

  #computeTheoricalEndDateTime() {
    let theoricalEndDateTime = dayjs(this.startDateTime || null);
    if (!theoricalEndDateTime.isValid()) {
      return;
    }

    theoricalEndDateTime = theoricalEndDateTime.add(DEFAULT_SESSION_DURATION_MINUTES, 'minute');
    let extraMinutes;
    if (this.isComplementaryCertificationInProgress) {
      extraMinutes = this.enrolledComplementaryCertification.certificationExtraTime ?? 0;
      theoricalEndDateTime = theoricalEndDateTime.add(extraMinutes, 'minute');
    }

    return theoricalEndDateTime.toDate();
  }
}

export { CertificationCandidateForSupervising };
