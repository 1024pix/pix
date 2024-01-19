import { expect } from '../../../../../../test-helper.js';
import * as serializer from '../../../../../../../src/certification/course/infrastructure/serializers/jsonapi/assessment-result-serializer.js';
import { AssessmentResult } from '../../../../../../../src/shared/domain/models/AssessmentResult.js';

describe('Unit | Serializer | JSONAPI | assessment-result-serializer', function () {
  describe('#deserialize()', function () {
    it('should convert a JSON API data into an AssessmentResult', async function () {
      const payload = {
        data: {
          attributes: {
            'assessment-id': 1,
            'comment-by-jury': 'comment',
            'comment-for-candidate': null,
            'comment-for-organization': 'another comment',
            emitter: 'Jury Pix',
            status: 'rejected',
            'pix-score': 0,
          },
        },
      };

      // when
      const deserializedAssessmentResult = await serializer.deserialize(payload);

      // then
      const expectedAssessmentResult = new AssessmentResult({
        assessmentId: 1,
        emitter: 'Jury Pix',
        commentByJury: 'comment',
        commentForCandidate: null,
        commentForOrganization: 'another comment',
        pixScore: 0,
        status: 'rejected',
      });
      expect(deserializedAssessmentResult).to.deep.equal(expectedAssessmentResult);
    });
  });
});
