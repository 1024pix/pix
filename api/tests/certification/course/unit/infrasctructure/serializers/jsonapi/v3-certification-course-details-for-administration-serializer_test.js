import * as serializer from '../../../../../../../src/certification/course/infrastructure/serializers/jsonapi/v3-certification-course-details-for-administration-serializer.js';

import { V3CertificationChallengeForAdministration } from '../../../../../../../src/certification/course/domain/models/V3CertificationChallengeForAdministration.js';
import { AnswerStatus } from '../../../../../../../src/shared/domain/models/AnswerStatus.js';
import { expect } from '../../../../../../test-helper.js';
import { V3CertificationCourseDetailsForAdministration } from '../../../../../../../src/certification/course/domain/models/V3CertificationCourseDetailsForAdministration.js';
import { V3CertificationChallengeLiveAlertForAdministration } from '../../../../../../../src/certification/course/domain/models/V3CertificationChallengeLiveAlertForAdministration.js';

describe('Unit | Serializer | JSONAPI | v3-certification-details-for-administration-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a Session model object into JSON API data including supervisor password', function () {
      // given
      const certificationCourseId = 123;
      const liveAlertId = 789;
      const challengeId = 'rec123';
      const answerStatus = AnswerStatus.OK;

      const certificationChallenge = new V3CertificationChallengeForAdministration({
        challengeId,
        answerStatus,
        validatedLiveAlert: new V3CertificationChallengeLiveAlertForAdministration({ id: liveAlertId }),
        answeredAt: new Date('2020-01-02'),
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
          },
        },
        included: [
          {
            type: 'certification-challenges-for-administration',
            id: challengeId,
            attributes: {
              'answer-status': 'ok',
              'validated-live-alert': { id: 789 },
              'answered-at': certificationChallenge.answeredAt,
            },
          },
        ],
      };

      const certificationDetails = new V3CertificationCourseDetailsForAdministration({
        certificationCourseId,
        certificationChallengesForAdministration: [certificationChallenge],
      });

      // when
      const json = serializer.serialize({ certificationDetails });

      // then
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
