const { NotFoundError } = require('../errors');
const Assessment = require('../models/Assessment');

module.exports = async function getAssessment(
  {
    // arguments
    assessmentId,
    // dependencies
    assessmentRepository,
    assessmentResultRepository,
    competenceRepository,
    courseRepository,
  }) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (!assessment) {
    throw new NotFoundError(`Assessment not found for ID ${assessmentId}`);
  }

  const latestAssessmentResult = await assessmentResultRepository.findLatestByAssessmentId(assessment.id);
  if (latestAssessmentResult) {
    assessment.estimatedLevel = latestAssessmentResult.level;
    assessment.pixScore = latestAssessmentResult.pixScore;
  } else {
    assessment.estimatedLevel = null;
    assessment.pixScore = null;
  }

  assessment.title = await _fetchAssessmentTitle({
    assessment,
    competenceRepository,
    courseRepository
  });

  return assessment;
};

async function _fetchAssessmentTitle({
  assessment,
  competenceRepository,
  courseRepository
}) {
  switch (assessment.type) {
    case Assessment.types.CERTIFICATION : {
      return assessment.certificationCourseId;
    }

    case Assessment.types.COMPETENCE_EVALUATION : {
      return await competenceRepository.getCompetenceName(assessment.competenceId);
    }

    case Assessment.types.DEMO : {
      return await courseRepository.getCourseName(assessment.courseId);
    }
    case Assessment.types.PREVIEW : {
      return 'Preview';
    }
    case Assessment.types.SMARTPLACEMENT : {
      return assessment.campaignParticipation.campaign.title;
    }

    default:
      return '';
  }
}
