import dayjs from 'dayjs';
import lodash from 'lodash';

import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../shared/domain/constants.js';

const { isNil } = lodash;
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
    this.authorizedToStart = authorizedToStart;
    this.assessmentStatus = assessmentStatus;
    this.startDateTime = startDateTime;
    this.enrolledComplementaryCertification = enrolledComplementaryCertification;
    this.isComplementaryCertificationInProgress = isComplementaryCertificationInProgress;
    this.theoricalEndDateTime = _computeTheoricalEndDateTime(
      startDateTime,
      isComplementaryCertificationInProgress,
      enrolledComplementaryCertification,
    );
  }

  authorizeToStart() {
    this.authorizedToStart = true;
  }
}

function _computeTheoricalEndDateTime(
  startDateTime,
  isComplementaryCertificationInProgress,
  enrolledComplementaryCertification,
) {
  let theoricalEndDateTime = dayjs(startDateTime || null);
  if (!theoricalEndDateTime.isValid()) {
    return;
  }

  theoricalEndDateTime = theoricalEndDateTime.add(DEFAULT_SESSION_DURATION_MINUTES, 'minute');
  let extraMinutes;
  if (isComplementaryCertificationInProgress) {
    extraMinutes = enrolledComplementaryCertification.certificationExtraTime ?? 0;
    theoricalEndDateTime = theoricalEndDateTime.add(extraMinutes, 'minute');
  }

  return theoricalEndDateTime.toDate();
}

export { CertificationCandidateForSupervising };
