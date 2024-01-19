import * as serializer from '../../../../../../../src/certification/course/infrastructure/serializers/jsonapi/v3-certification-course-details-for-administration-serializer.js';

import { V3CertificationChallengeForAdministration } from '../../../../../../../src/certification/course/domain/models/V3CertificationChallengeForAdministration.js';
import { AnswerStatus } from '../../../../../../../src/shared/domain/models/AnswerStatus.js';
import { expect } from '../../../../../../test-helper.js';
import { V3CertificationCourseDetailsForAdministration } from '../../../../../../../src/certification/course/domain/models/V3CertificationCourseDetailsForAdministration.js';
import { V3CertificationChallengeLiveAlertForAdministration } from '../../../../../../../src/certification/course/domain/models/V3CertificationChallengeLiveAlertForAdministration.js';
import { Assessment } from '../../../../../../../src/shared/domain/models/Assessment.js';
import { ABORT_REASONS } from '../../../../../../../lib/domain/models/CertificationCourse.js';
import { AssessmentResult } from '../../../../../../../src/shared/domain/models/AssessmentResult.js';

describe('Unit | Serializer | JSONAPI | v3-certification-details-for-administration-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a V3CertificationChallengeForAdministration model object into JSON API', function () {
      // given
      const certificationCourseId = 123;
      const liveAlertId = 789;
      const challengeId = 'rec123';
      const answerStatus = AnswerStatus.OK;
      const competenceName = 'name';
      const competenceIndex = '1.2';
      const skillName = '@toto';
      const answerValue = 'Some answer';
      const isRejectedForFraud = true;
      const isCancelled = true;
      const createdAt = new Date('2022-02-02');
      const completedAt = new Date('2022-02-03');
      const assessmentState = Assessment.states.ENDED_DUE_TO_FINALIZATION;
      const assessmentResultStatus = AssessmentResult.status.VALIDATED;
      const abortReason = ABORT_REASONS.CANDIDATE;
      const pixScore = 60;

      const certificationChallenge = new V3CertificationChallengeForAdministration({
        challengeId,
        answerStatus,
        validatedLiveAlert: new V3CertificationChallengeLiveAlertForAdministration({
          id: liveAlertId,
          issueReportSubcategory: 'WEBSITE_BLOCKED',
        }),
        answeredAt: new Date('2020-01-02'),
        answerValue,
        competenceName,
        competenceIndex,
        skillName,
      });

      const expectedJsonApi = {
        data: {
          id: `${certificationCourseId}`,
          type: 'v3-certification-course-details-for-administrations',
          relationships: {
            'certification-challenges-for-administration': {
              data: [{ type: 'certification-challenges-for-administration', id: challengeId }],
            },
          },
          attributes: {
            'certification-course-id': certificationCourseId,
            'is-rejected-for-fraud': isRejectedForFraud,
            'is-cancelled': isCancelled,
            'created-at': createdAt,
            'completed-at': completedAt,
            'assessment-state': assessmentState,
            'assessment-result-status': assessmentResultStatus,
            'abort-reason': abortReason,
            'pix-score': pixScore,
          },
        },
        included: [
          {
            type: 'certification-challenges-for-administration',
            id: challengeId,
            attributes: {
              'answer-status': 'ok',
              'validated-live-alert': {
                id: liveAlertId,
                issueReportSubcategory: certificationChallenge.validatedLiveAlert.issueReportSubcategory,
              },
              'answered-at': certificationChallenge.answeredAt,
              'answer-value': answerValue,
              'competence-name': competenceName,
              'competence-index': competenceIndex,
              'skill-name': skillName,
            },
          },
        ],
      };

      const certificationDetails = new V3CertificationCourseDetailsForAdministration({
        certificationCourseId,
        isRejectedForFraud,
        isCancelled,
        createdAt,
        completedAt,
        assessmentState,
        assessmentResultStatus,
        abortReason,
        pixScore,
        certificationChallengesForAdministration: [certificationChallenge],
      });

      // when
      const json = serializer.serialize({ certificationDetails });

      // then
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
