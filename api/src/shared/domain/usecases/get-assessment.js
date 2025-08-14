import * as injectedCertificationChallengeLiveAlertRepository from '../../../certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as injectedCertificationCompanionAlertRepository from '../../../certification/shared/infrastructure/repositories/certification-companion-alert-repository.js';
import * as injectedAssessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as injectedCompetenceRepository from '../../infrastructure/repositories/competence-repository.js';
import * as injectedCourseRepository from '../../infrastructure/repositories/course-repository.js';
import { NotFoundError } from '../errors.js';
import { Assessment } from '../models/Assessment.js';

export async function getAssessment({
  assessmentId,
  locale,
  assessmentRepository = injectedAssessmentRepository,
  competenceRepository = injectedCompetenceRepository,
  courseRepository = injectedCourseRepository,
  certificationChallengeLiveAlertRepository = injectedCertificationChallengeLiveAlertRepository,
  certificationCompanionAlertRepository = injectedCertificationCompanionAlertRepository,
} = {}) {
  const assessment = await assessmentRepository.getWithAnswers(assessmentId);
  switch (assessment.type) {
    case Assessment.types.CERTIFICATION: {
      const challengeLiveAlerts = await certificationChallengeLiveAlertRepository.getByAssessmentId({
        assessmentId: assessment.id,
      });
      const companionLiveAlerts = await certificationCompanionAlertRepository.getAllByAssessmentId({
        assessmentId: assessment.id,
      });
      assessment.attachLiveAlerts({ challengeLiveAlerts, companionLiveAlerts });
      break;
    }

    case Assessment.types.COMPETENCE_EVALUATION: {
      assessment.title = await competenceRepository.getCompetenceName({ id: assessment.competenceId, locale });
      break;
    }

    case Assessment.types.DEMO: {
      const course = await courseRepository.get(assessment.courseId);
      if (!course.canBePlayed) {
        throw new NotFoundError("Le test demandé n'existe pas");
      }
      assessment.title = course.name;
      break;
    }
  }

  return assessment;
}
