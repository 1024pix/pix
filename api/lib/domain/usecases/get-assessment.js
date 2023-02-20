import Assessment from '../models/Assessment';

export default async function getAssessment({
  assessmentId,
  locale,
  assessmentRepository,
  competenceRepository,
  courseRepository,
  campaignRepository,
}) {
  const assessment = await assessmentRepository.getWithAnswers(assessmentId);

  assessment.title = await _fetchAssessmentTitle({
    assessment,
    locale,
    competenceRepository,
    courseRepository,
    campaignRepository,
  });

  if (assessment.type === Assessment.types.CAMPAIGN) {
    assessment.campaignCode = await campaignRepository.getCampaignCodeByCampaignParticipationId(
      assessment.campaignParticipationId
    );
  }
  return assessment;
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
