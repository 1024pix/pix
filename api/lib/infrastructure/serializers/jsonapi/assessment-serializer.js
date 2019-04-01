const Assessment = require('../../../domain/models/Assessment');
const SmartPlacementProgression = require('../../../domain/models/SmartPlacementProgression');
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
          assessment.certificationNumber = currentAssessment.courseId;
        }

        // Same here for isSmartPlacement()
        if (currentAssessment.type === Assessment.types.SMARTPLACEMENT) {
          assessment.smartPlacementProgression = {
            id: SmartPlacementProgression.generateIdFromAssessmentId(currentAssessment.id),
          };
        }

        if (currentAssessment.campaignParticipation && currentAssessment.campaignParticipation.campaign) {
          assessment.codeCampaign = currentAssessment.campaignParticipation.campaign.code;
        }

        if (!currentAssessment.course) {
          assessment.course = { id: currentAssessment.courseId };
        }

        return assessment;
      },
      attributes: ['estimatedLevel', 'pixScore', 'type', 'state', 'answers', 'codeCampaign', 'certificationNumber', 'course', 'smartPlacementProgression'],
      answers: {
        ref: 'id',
      },
      course: {
        ref: 'id',
        included: _includeCourse(assessments),
        attributes: ['name', 'description', 'nbChallenges'],
      },
      smartPlacementProgression: {
        ref: 'id',
        relationshipLinks: {
          related(record, current) {
            return `/smart-placement-progressions/${current.id}`;
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

    return Assessment.fromAttributes({
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

  return assessments.course;
}
