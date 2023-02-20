import Assessment from '../../../domain/models/Assessment';
import Progression from '../../../domain/models/Progression';
import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(assessments) {
    return new Serializer('assessment', {
      transform(currentAssessment) {
        const assessment = Object.assign({}, currentAssessment);

        // TODO: We can't use currentAssessment.isCertification() because
        // this serializer is also used by model CampaignAssessment
        assessment.certificationNumber = null;
        if (currentAssessment.type === Assessment.types.CERTIFICATION) {
          assessment.certificationNumber = currentAssessment.certificationCourseId;
          assessment.certificationCourse = { id: currentAssessment.certificationCourseId };
        }

        // Same here for isForCampaign() and isCompetenceEvaluation()
        if ([Assessment.types.CAMPAIGN, Assessment.types.COMPETENCE_EVALUATION].includes(currentAssessment.type)) {
          assessment.progression = {
            id: Progression.generateIdFromAssessmentId(currentAssessment.id),
          };
        }

        if (currentAssessment.type === Assessment.types.CAMPAIGN) {
          assessment.codeCampaign = currentAssessment.campaignCode;
        }

        if (!currentAssessment.course) {
          assessment.course = { id: currentAssessment.courseId };
        }

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
        'lastQuestionState',
        'method',
      ],
      answers: {
        ref: 'id',
        relationshipLinks: {
          related(record) {
            return `/api/answers?assessmentId=${record.id}`;
          },
        },
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
          },
        },
      },
      progression: {
        ref: 'id',
        relationshipLinks: {
          related(record, current) {
            return `/api/progressions/${current.id}`;
          },
        },
      },
    }).serialize(assessments);
  },

  deserialize(json) {
    const type = json.data.attributes.type;
    const method = Assessment.computeMethodFromType(type);

    let courseId = null;
    if (type !== Assessment.types.CAMPAIGN && type !== Assessment.types.PREVIEW) {
      courseId = json.data.relationships.course.data.id;
    }

    return new Assessment({
      id: json.data.id,
      type,
      courseId,
      method,
    });
  },
};

function _includeCourse(assessments) {
  if (Array.isArray(assessments)) {
    return assessments.length && assessments[0].course;
  }

  return assessments.course ? true : false;
}
