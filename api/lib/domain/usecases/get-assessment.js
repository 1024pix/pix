import { NotFoundError } from '../../../src/shared/domain/errors.js';
import { Assessment } from '../../../src/shared/domain/models/index.js';

export async function getAssessment({
  assessmentId,
  locale,
  assessmentRepository,
  competenceRepository,
  courseRepository,
  campaignRepository,
  certificationChallengeLiveAlertRepository,
  certificationCompanionAlertRepository,
}) {
  const assessment = await assessmentRepository.getWithAnswers(assessmentId);
  switch (assessment.type) {
    case Assessment.types.CERTIFICATION: {
      await _addCertificationRelatedAttributes({
        assessment,
        certificationChallengeLiveAlertRepository,
        certificationCompanionAlertRepository,
      });
      assessment.showProgressBar = false;
      assessment.hasCheckpoints = false;
      assessment.showLevelup = false;
      assessment.title = assessment.certificationCourseId;
      break;
    }

    case Assessment.types.COMPETENCE_EVALUATION: {
      assessment.showProgressBar = true;
      assessment.hasCheckpoints = true;
      assessment.showLevelup = true;
      assessment.title = await competenceRepository.getCompetenceName({ id: assessment.competenceId, locale });
      break;
    }

    case Assessment.types.DEMO: {
      const course = await courseRepository.get(assessment.courseId);
      if (!course.canBePlayed) {
        throw new NotFoundError("Le test demandé n'existe pas");
      }
      assessment.showProgressBar = true;
      assessment.hasCheckpoints = false;
      assessment.showLevelup = false;
      assessment.title = await courseRepository.getCourseName(assessment.courseId);
      break;
    }
    case Assessment.types.PREVIEW: {
      assessment.showProgressBar = false;
      assessment.hasCheckpoints = false;
      assessment.showLevelup = false;
      assessment.title = 'Preview';
      break;
    }
    case Assessment.types.CAMPAIGN: {
      const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(
        assessment.campaignParticipationId,
      );
      const campaign = await campaignRepository.get(campaignId);
      assessment.campaignCode = campaign.code;
      assessment.showProgressBar = false;
      assessment.hasCheckpoints = false;
      assessment.showLevelup = false;
      if (!assessment.isFlash() && (campaign.isAssessment || campaign.isExam)) {
        assessment.showProgressBar = true;
        assessment.hasCheckpoints = true;
        assessment.showLevelup = true;
      }
      assessment.title = campaign.title;
      break;
    }

    default: {
      assessment.showProgressBar = false;
      assessment.hasCheckpoints = false;
      assessment.showLevelup = false;
      assessment.title = '';
    }
  }

  return assessment;
}

async function _addCertificationRelatedAttributes({
  assessment,
  certificationChallengeLiveAlertRepository,
  certificationCompanionAlertRepository,
}) {
  if (assessment.type !== Assessment.types.CERTIFICATION) {
    return;
  }
  const challengeLiveAlerts = await certificationChallengeLiveAlertRepository.getByAssessmentId({
    assessmentId: assessment.id,
  });

  const companionLiveAlerts = await certificationCompanionAlertRepository.getAllByAssessmentId({
    assessmentId: assessment.id,
  });

  assessment.attachLiveAlerts({ challengeLiveAlerts, companionLiveAlerts });
}
