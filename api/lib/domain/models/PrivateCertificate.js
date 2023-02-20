import { status as assessmentResultStatuses } from './AssessmentResult';

const status = {
  REJECTED: 'rejected',
  VALIDATED: 'validated',
  ERROR: 'error',
  CANCELLED: 'cancelled',
  STARTED: 'started',
};

class PrivateCertificate {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    isPublished,
    userId,
    date,
    deliveredAt,
    certificationCenter,
    pixScore,
    status,
    commentForCandidate,
    certifiedBadgeImages,
    resultCompetenceTree = null,
    verificationCode,
    maxReachableLevelOnCertificationDate,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.isPublished = isPublished;
    this.userId = userId;
    this.date = date;
    this.deliveredAt = deliveredAt;
    this.certificationCenter = certificationCenter;
    this.pixScore = pixScore;
    this.status = status;
    this.commentForCandidate = commentForCandidate;
    this.certifiedBadgeImages = certifiedBadgeImages;
    this.resultCompetenceTree = resultCompetenceTree;
    this.verificationCode = verificationCode;
    this.maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
  }

  static buildFrom({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    isPublished,
    userId,
    date,
    deliveredAt,
    certificationCenter,
    pixScore,
    commentForCandidate,
    certifiedBadgeImages,
    resultCompetenceTree = null,
    verificationCode,
    maxReachableLevelOnCertificationDate,
    assessmentResultStatus,
    isCancelled,
  }) {
    const status = _computeStatus(assessmentResultStatus, isCancelled);
    return new PrivateCertificate({
      id,
      firstName,
      lastName,
      birthdate,
      birthplace,
      isPublished,
      userId,
      date,
      deliveredAt,
      certificationCenter,
      pixScore,
      commentForCandidate,
      certifiedBadgeImages,
      resultCompetenceTree,
      verificationCode,
      maxReachableLevelOnCertificationDate,
      status,
    });
  }

  setResultCompetenceTree(resultCompetenceTree) {
    this.resultCompetenceTree = resultCompetenceTree;
  }
}

function _computeStatus(assessmentResultStatus, isCancelled) {
  if (isCancelled) return status.CANCELLED;
  if (assessmentResultStatus === assessmentResultStatuses.VALIDATED) return status.VALIDATED;
  if (assessmentResultStatus === assessmentResultStatuses.REJECTED) return status.REJECTED;
  if (assessmentResultStatus === assessmentResultStatuses.ERROR) return status.ERROR;
  return status.STARTED;
}

PrivateCertificate.status = status;

export default PrivateCertificate;
