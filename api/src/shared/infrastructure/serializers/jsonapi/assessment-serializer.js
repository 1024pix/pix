import jsonapiSerializer from 'jsonapi-serializer';
import isEmpty from 'lodash/isEmpty.js';

import { DomainError } from '../../../domain/errors.js';
import { Assessment } from '../../../domain/models/Assessment.js';
import { config as challengeSerializerConfig } from './challenge-serializer.js';

const { Serializer } = jsonapiSerializer;

const typesMapping = {
  answers: 'answers',
  nextChallenge: 'challenges',
  course: 'courses',
  certificationCourse: 'certification-courses',
  progression: 'progressions',
  campaign: 'campaigns',
};

const serialize = function (assessments) {
  const serializer = new Serializer('assessment', {
    attributes: [
      'title',
      'type',
      'state',
      'createdAt',
      'answers',
      'codeCampaign',
      'certificationNumber',
      'hasOngoingChallengeLiveAlert',
      'hasOngoingCompanionLiveAlert',
      'course',
      'certificationCourse',
      'progression',
      'competenceId',
      'lastQuestionState',
      'method',
      'showChallengeStepper',
      'showGlobalProgression',
      'hasCheckpoints',
      'showLevelup',
      'showQuestionCounter',
      'orderedChallengeIdsAnswered',
      'nextChallenge',
      'campaign',
    ],
    typeForAttribute: (attribute) => typesMapping[attribute],
    answers: {
      ref: 'id',
      relationshipLinks: {
        related(record) {
          return `/api/answers?assessmentId=${record.id}`;
        },
      },
    },
    campaign: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related: function (record) {
          if (record.type !== 'CAMPAIGN') {
            return null;
          }
          return `/api/campaigns?filter[code]=${record.codeCampaign}`;
        },
      },
    },
    nextChallenge: {
      ref: 'id',
      ...challengeSerializerConfig,
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
          if (!current) {
            return null;
          }
          return `/api/progressions/${current.id}`;
        },
      },
    },
  });

  const result = serializer.serialize(assessments);

  if (isEmpty(result.data.relationships.campaign)) {
    delete result.data.relationships.campaign;
  }

  return result;
};

const deserialize = function (json) {
  const type = json.data.attributes.type;
  if (![Assessment.types.DEMO, Assessment.types.PREVIEW].includes(type)) {
    throw new DomainError('Only allowed to create DEMO or PREVIEW type of assessment');
  }
  const method = Assessment.computeMethodFromType(type);

  let courseId = null;
  if (type !== Assessment.types.PREVIEW) {
    courseId = json.data.relationships.course.data.id;
  }

  return new Assessment({
    id: json.data.id,
    type,
    courseId,
    method,
  });
};

export { deserialize, serialize };

function _includeCourse(assessments) {
  if (Array.isArray(assessments)) {
    return assessments.length && assessments[0].course;
  }

  return assessments.course ? true : false;
}
