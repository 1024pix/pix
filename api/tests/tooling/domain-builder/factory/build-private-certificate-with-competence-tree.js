import PrivateCertificate from '../../../../lib/domain/models/PrivateCertificate';
import buildAssessmentResult from './build-assessment-result';
import buildResultCompetenceTree from './build-result-competence-tree';

export default function buildPrivateCertificate({
  id = 1,
  assessmentResults = [buildAssessmentResult()],
  assessmentState = 'completed',
  birthdate = '1992-06-12',
  birthplace = 'Paris',
  certificationCenter = 'L’université du Pix',
  date = new Date('2018-12-01T01:02:03Z'),
  firstName = 'Jean',
  deliveredAt = new Date('2018-10-03T01:02:03Z'),
  isPublished = true,
  lastName = 'Bon',
  userId = 1,
  // set to overried computed properties
  commentForCandidate,
  pixScore,
  status,
  cleaCertificationStatus = 'acquired',
  verificationCode = 'P-BBBCCCDD',
  maxReachableLevelOnCertificationDate = 5,

  // the id of the ResultCompetenceTree should be with the most recent assessment result.
  resultCompetenceTree = buildResultCompetenceTree({ id: `${id}-${assessmentResults[0].id}` }),
} = {}) {
  const certificate = new PrivateCertificate({
    id,
    assessmentState,
    assessmentResults,
    birthdate,
    birthplace,
    certificationCenter,
    date,
    firstName,
    deliveredAt,
    isPublished,
    lastName,
    userId,
    resultCompetenceTree,
    cleaCertificationStatus,
    verificationCode,
    maxReachableLevelOnCertificationDate,
  });

  if (pixScore !== undefined) {
    certificate.pixScore = pixScore;
  }
  if (status !== undefined) {
    certificate.status = status;
  }
  if (commentForCandidate !== undefined) {
    certificate.commentForCandidate = commentForCandidate;
  }
  if (commentForCandidate !== undefined) {
    certificate.commentForCandidate = commentForCandidate;
  }

  return certificate;
}
