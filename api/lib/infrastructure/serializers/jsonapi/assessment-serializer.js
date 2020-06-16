const Assessment = require('../../../domain/models/Assessment');
const Progression = require('../../../domain/models/Progression');
const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(assessments) {
    return new Serializer('assessment', {
      transform(currentAssessment) {
        const assessment = Object.assign({}, currentAssessment);

        // TODO: We can't use currentAssessment.isCertification() because
        // this serializer is also used by model SmartPlacementAssessment
        assessment.certificationNumber = null;
        if (currentAssessment.type === Assessment.types.CERTIFICATION) {
          assessment.certificationNumber = currentAssessment.certificationCourseId;
          assessment.certificationCourse = { id: currentAssessment.certificationCourseId };
        }

        // Same here for isSmartPlacement() and isCompetenceEvaluation()
        if ([Assessment.types.SMARTPLACEMENT, Assessment.types.COMPETENCE_EVALUATION].includes(currentAssessment.type)) {
          assessment.progression = {
            id: Progression.generateIdFromAssessmentId(currentAssessment.id),
          };
        }

        if (currentAssessment.campaignParticipation && currentAssessment.campaignParticipation.campaign) {
          assessment.codeCampaign = currentAssessment.campaignParticipation.campaign.code;
        }

        if (!currentAssessment.course) {
          assessment.course = { id: currentAssessment.courseId };
        }

        assessment.title = currentAssessment.title;

        return assessment;
      },
      attributes: [
        'title',
        'type',
        'state',
        'answers',
        'codeCampaign',
        'certificationNumber',
        'course',
        'certificationCourse',
        'progression',
        'competenceId',
      ],
      answers: {
        ref: 'id',
        relationshipLinks: {
          related(record) {
            return `/api/answers?assessmentId=${record.id}`;
          }
        }
      },
      course: {
        ref: 'id',
        included: _includeCourse(assessments),
        attributes: ['name', 'description', 'nbChallenges'],
      },
      certificationCourse: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current) {
            return `/api/certification-courses/${current.id}`;
          }
        }
      },
      progression: {
        ref: 'id',
        relationshipLinks: {
          related(record, current) {
            return `/api/progressions/${current.id}`;
          }
        }
      }
    }).serialize(assessments);
  },

  deserialize(json) {
    const type = json.data.attributes.type;

    let courseId = null;
    if (type !== Assessment.types.SMARTPLACEMENT && type !== Assessment.types.PREVIEW) {
      courseId = json.data.relationships.course.data.id;
    }

    return new Assessment({
      id: json.data.id,
      type,
      courseId,
    });
  }
};

function _includeCourse(assessments) {
  if (Array.isArray(assessments)) {
    return (assessments.length && assessments[0].course);
  }

  return assessments.course ? true : false;
}
