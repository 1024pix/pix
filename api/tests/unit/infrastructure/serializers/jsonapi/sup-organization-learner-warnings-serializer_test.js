import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/sup-organization-learner-warnings-serializer';

describe('Unit | Serializer | sup-organization-learner-warnings-serializer', function () {
  describe('#serialize', function () {
    it('should return a JSON API serialized warning', function () {
      // given
      const importWarnings = {
        id: 123,
        warnings: [
          { studentNumber: '123', field: 'toto', code: 'titi', value: 'yo' },
          { studentNumber: '123', field: 'tata', code: 'tutu', value: 'ya' },
        ],
      };
      const meta = { some: 'meta' };

      // when
      const serialized = serializer.serialize(importWarnings, meta);

      // then
      expect(serialized).to.deep.equal({
        data: {
          type: 'sup-organization-learner-warnings',
          id: importWarnings.id.toString(),
          attributes: {
            warnings: importWarnings.warnings,
          },
        },
        meta: { some: 'meta' },
      });
    });
  });
});
