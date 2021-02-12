const { NotFoundError } = require('../errors');
const Assessment = require('../models/Assessment');

module.exports = async function getAssessment({
  assessmentId,
  locale,
  assessmentRepository,
  competenceRepository,
  courseRepository,
}) {
  const assessment = await assessmentRepository.getWithAnswersAndCampaignParticipation(assessmentId);
  if (!assessment) {
    throw new NotFoundError(`Assessment not found for ID ${assessmentId}`);
  }

  assessment.title = await _fetchAssessmentTitle({
    assessment,
    locale,
    competenceRepository,
    courseRepository,
  });

  return assessment;
};

async function _fetchAssessmentTitle({
  assessment,
  locale,
  competenceRepository,
  courseRepository,
}) {
  switch (assessment.type) {
    case Assessment.types.CERTIFICATION : {
      return assessment.certificationCourseId;
    }

    case Assessment.types.COMPETENCE_EVALUATION : {
      return await competenceRepository.getCompetenceName({ id: assessment.competenceId, locale });
    }

    case Assessment.types.DEMO : {
      return await courseRepository.getCourseName(assessment.courseId);
    }
    case Assessment.types.PREVIEW : {
      return 'Preview';
    }
    case Assessment.types.CAMPAIGN : {
      return assessment.campaignParticipation.campaign.title;
    }

    default:
      return '';
  }
}
