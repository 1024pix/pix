const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/higher-schooling-registration-warnings-serializer');

describe('Unit | Serializer | higher-schooling-registration-warnings-serializer', () => {

  describe('#serialize', () => {

    it('should return a JSON API serialized warning', () => {
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
          type: 'higher-schooling-registration-warnings',
          id: importWarnings.id.toString(),
          attributes: {
            'warnings': importWarnings.warnings,
          },
        },
        meta: { some: 'meta' },
      });
    });
  });
});
