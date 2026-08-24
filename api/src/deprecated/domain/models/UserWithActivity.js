import dayjs from 'dayjs';

import { STATUS } from '../../../legal-documents/domain/models/LegalDocumentStatus.js';
import { config } from '../../../shared/config.js';

class UserWithActivity {
  constructor({ user, tosStatus, hasAssessmentParticipations, codeForLastProfileToShare, hasRecommendedTrainings }) {
    Object.assign(this, user);

    this.hasAssessmentParticipations = hasAssessmentParticipations;
    this.codeForLastProfileToShare = codeForLastProfileToShare;
    this.hasRecommendedTrainings = hasRecommendedTrainings;
    //legacy tos
    this.cgu = tosStatus.status === STATUS.ACCEPTED || tosStatus.status === STATUS.UPDATE_REQUESTED;
    this.mustValidateTermsOfService =
      tosStatus.status === STATUS.REQUESTED || tosStatus.status === STATUS.UPDATE_REQUESTED;
    this.lastTermsOfServiceValidatedAt = tosStatus.acceptedAt;
    //new tos
    this.pixAppTermsOfServiceStatus = tosStatus.status;
    this.pixAppTermsOfServiceDocumentPath = tosStatus.documentPath;
  }

  get shouldSeeDataProtectionPolicyInformationBanner() {
    const isLearner = this.pixAppTermsOfServiceStatus === STATUS.NOT_APPLICABLE;
    if (isLearner) {
      return false;
    }
    const parsedDate = new Date(this.lastDataProtectionPolicySeenAt);
    return dayjs(parsedDate).isBefore(dayjs(config.dataProtectionPolicy.updateDate));
  }
}

export { UserWithActivity };
