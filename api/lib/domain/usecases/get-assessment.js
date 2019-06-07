const { NotFoundError } = require('../errors');
const { MAX_REACHABLE_LEVEL } = require('../constants');
const Assessment = require('../models/Assessment');

module.exports = async function getAssessment(
  {
    // arguments
    assessmentId,
    // dependencies
    assessmentRepository,
    competenceRepository,
    courseRepository,
  }) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (!assessment) {
    throw new NotFoundError(`Assessment not found for ID ${assessmentId}`);
  }
  const assessmentResult = assessment.getLastAssessmentResult();

  if (assessmentResult) {
    assessment.estimatedLevel = Math.min(assessmentResult.level, MAX_REACHABLE_LEVEL);
    assessment.pixScore = assessmentResult.pixScore;
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
      return assessment.courseId;
    }

    case Assessment.types.COMPETENCE_EVALUATION : {
      return await competenceRepository.getCompetenceName(assessment.competenceId);
    }

    case Assessment.types.DEMO : {
      return await _fetchCourseName(assessment.courseId, courseRepository);
    }

    case Assessment.types.PLACEMENT : {
      return await _fetchCourseName(assessment.courseId, courseRepository);
    }

    case Assessment.types.PREVIEW : {
      return await _fetchCourseName(assessment.courseId, courseRepository);
    }

    case Assessment.types.SMARTPLACEMENT : {
      return assessment.campaignParticipation.campaign.title;
    }

    default:
      return undefined;
  }
}

function _fetchCourseName(courseId, courseRepository) {
  return courseRepository.get(courseId)
    .then((course) => {
      return course.name;
    })
    .catch(() => {
      throw new NotFoundError('Le cours demandé n\'existe pas');
    });
}
