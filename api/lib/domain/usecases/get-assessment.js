import { NotFoundError } from '../../../src/shared/domain/errors.js';
import { Assessment } from '../../../src/shared/domain/models/index.js';

const getAssessment = async function ({
  assessmentId,
  locale,
  assessmentRepository,
  competenceRepository,
  courseRepository,
  campaignRepository,
  certificationChallengeLiveAlertRepository,
}) {
  const assessment = await assessmentRepository.getWithAnswers(assessmentId);

  assessment.title = await _fetchAssessmentTitle({
    assessment,
    locale,
    competenceRepository,
    courseRepository,
    campaignRepository,
  });

  await _addCampaignRelatedAttributes(assessment, campaignRepository);
  await _addDemoRelatedAttributes(assessment, courseRepository);
  await _addCertificationRelatedAttributes(assessment, certificationChallengeLiveAlertRepository);
  return assessment;
};

export { getAssessment };

async function _addCampaignRelatedAttributes(assessment, campaignRepository) {
  if (assessment.type === Assessment.types.CAMPAIGN) {
    assessment.campaignCode = await campaignRepository.getCampaignCodeByCampaignParticipationId(
      assessment.campaignParticipationId,
    );
  }
}

async function _addDemoRelatedAttributes(assessment, courseRepository) {
  if (assessment.type === Assessment.types.DEMO) {
    const course = await courseRepository.get(assessment.courseId);
    if (!course.canBePlayed) {
      throw new NotFoundError("Le test demandé n'existe pas");
    }
  }
}

async function _addCertificationRelatedAttributes(assessment, liveAlertRepository) {
  if (assessment.type === Assessment.types.CERTIFICATION) {
    const liveAlerts = await liveAlertRepository.getByAssessmentId({ assessmentId: assessment.id });

    assessment.attachLiveAlerts(liveAlerts);
  }
}

function _fetchAssessmentTitle({ assessment, locale, competenceRepository, courseRepository, campaignRepository }) {
  switch (assessment.type) {
    case Assessment.types.CERTIFICATION: {
      return assessment.certificationCourseId;
    }

    case Assessment.types.COMPETENCE_EVALUATION: {
      return competenceRepository.getCompetenceName({ id: assessment.competenceId, locale });
    }

    case Assessment.types.DEMO: {
      return courseRepository.getCourseName(assessment.courseId);
    }
    case Assessment.types.PREVIEW: {
      return 'Preview';
    }
    case Assessment.types.CAMPAIGN: {
      return campaignRepository.getCampaignTitleByCampaignParticipationId(assessment.campaignParticipationId);
    }

    default:
      return '';
  }
}
