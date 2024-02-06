import { expect } from '../../../../../../test-helper.js';
import * as serializer from '../../../../../../../src/certification/course/infrastructure/serializers/jsonapi/jury-comments-serializer.js';

describe('Unit | Serializer | JSONAPI | jury-comments-serializer', function () {
  describe('#deserialize()', function () {
    it('should convert a JSON API data', async function () {
      const payload = {
        data: {
          attributes: {
            'comment-by-jury': '',
            'comment-for-candidate': null,
            'comment-for-organization': 'another comment',
          },
        },
      };

      // when
      const deserializedAssessmentResult = await serializer.deserialize(payload);

      // then
      const expectedPayload = {
        commentByJury: undefined,
        commentForCandidate: undefined,
        commentForOrganization: 'another comment',
      };
      expect(deserializedAssessmentResult).to.deep.equal(expectedPayload);
    });
  });
});
