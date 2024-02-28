import { expect } from '../../../../../../test-helper.js';
import * as serializer from '../../../../../../../src/certification/course/infrastructure/serializers/jsonapi/jury-comment-serializer.js';

describe('Unit | Serializer | JSONAPI | jury-comment-serializer', function () {
  describe('#deserialize()', function () {
    it('should convert a JSON API data', async function () {
      const payload = {
        data: {
          attributes: {
            'comment-by-jury': '',
          },
        },
      };

      // when
      const deserializedJuryComment = await serializer.deserialize(payload);

      // then
      const expectedCommentByJury = undefined;
      expect(deserializedJuryComment).to.equal(expectedCommentByJury);
    });

    it('should sanitize a padded jury comment', async function () {
      const payload = {
        data: {
          attributes: {
            'comment-by-jury': '        mon texte avec des espaces avant et après      ',
          },
        },
      };

      // when
      const deserializedJuryComment = await serializer.deserialize(payload);

      // then
      const expectedCommentByJury = 'mon texte avec des espaces avant et après';
      expect(deserializedJuryComment).to.equal(expectedCommentByJury);
    });
  });
});
