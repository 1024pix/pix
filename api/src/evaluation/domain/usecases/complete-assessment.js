import { scoreDiagJobRepository } from '../../infrastructure/repositories/jobs/score-diag-job-repository.js';
import { AlreadyRatedAssessmentError } from '../errors.js';
import { DiagCompletedJob } from '../events/ScoreDiag.js';

const completeAssessment = async function ({
  assessmentId,
  assessmentRepository,
  certificationEvaluationRepository,
  locale,
}) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (assessment.isCertification()) {
    await certificationEvaluationRepository.completeCertificationAssessment({
      certificationCourseId: assessment.certificationCourseId,
      locale,
    });
    return await assessmentRepository.get(assessmentId);
  }

  if (assessment.isIRT()) {
    // todo plus tard
    await scoreDiagJobRepository.performAsync(
      new DiagCompletedJob({
        assessmentId: assessment.id,
        locale,
      }),
    );
    return await assessmentRepository.get(assessmentId);
  }

  if (assessment.isCompleted()) {
    throw new AlreadyRatedAssessmentError();
  }

  await assessmentRepository.completeByAssessmentId(assessmentId);
  return assessment;
};

export { completeAssessment };
