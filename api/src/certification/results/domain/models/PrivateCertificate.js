import { status as assessmentResultStatuses } from '../../../../shared/domain/models/AssessmentResult.js';
import { JuryComment, JuryCommentContexts } from '../../../shared/domain/models/JuryComment.js';

/**
 * @readonly
 * @enum {string}
 */
const status = Object.freeze({
  REJECTED: 'rejected',
  VALIDATED: 'validated',
  ERROR: 'error',
  CANCELLED: 'cancelled',
  STARTED: 'started',
});

class PrivateCertificate {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {string} props.firstName
   * @param {string} props.lastName
   * @param {string} props.birthplace
   * @param {boolean} props.isPublished
   * @param {number} props.userId
   * @param {Date} props.date
   * @param {Date} props.deliveredAt
   * @param {string} props.certificationCenter
   * @param {number} props.pixScore
   * @param {status} props.status
   * @param {JuryComment} props.commentForCandidate
   * @param {Array<string>} props.certifiedBadgeImages
   * @param {Object} props.resultCompetenceTree
   * @param {string} props.verificationCode
   * @param {Date} props.maxReachableLevelOnCertificationDate
   */
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
    commentByAutoJury,
    certifiedBadgeImages,
    resultCompetenceTree = null,
    verificationCode,
    maxReachableLevelOnCertificationDate,
    assessmentResultStatus,
    isCancelled,
  }) {
    const status = _computeStatus(assessmentResultStatus, isCancelled);
    const juryComment = new JuryComment({
      commentByAutoJury,
      fallbackComment: commentForCandidate,
      context: JuryCommentContexts.CANDIDATE,
    });
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
      commentForCandidate: juryComment,
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

export { PrivateCertificate };
