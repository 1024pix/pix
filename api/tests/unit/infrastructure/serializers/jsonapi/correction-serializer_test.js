const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/correction-serializer');
const Correction = require('../../../../../lib/domain/models/Correction');
const Hint = require('../../../../../lib/domain/models/Hint');

describe('Unit | Serializer | JSONAPI | correction-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Correction model object into JSON API data', function() {

      const correction = new Correction({
        id: 'correction_id',
        solution: 'Correction value',
        hints: [
          new Hint({ skillName: '@test2', value: 'Indice moins Facile' }),
          new Hint({ skillName: '@test1', value: 'Indice Facile' })
        ]
      });

      // when
      const json = serializer.serialize(correction);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'corrections',
          id: 'correction_id',
          attributes: {
            solution: 'Correction value',
            hint: 'Indice Facile'
          }
        }
      });
    });
  });
});
