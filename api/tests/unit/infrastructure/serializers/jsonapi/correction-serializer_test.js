const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/correction-serializer');
const Correction = require('../../../../../lib/domain/models/Correction');

describe('Unit | Serializer | JSONAPI | correction-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Correction model object into JSON API data', function() {

      const correction = new Correction({
        id: 'correction_id',
        solution: 'Correction value'
      });

      // when
      const json = serializer.serialize(correction);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'corrections',
          id: correction.id,
          attributes: {
            solution: correction.solution
          }
        }
      });
    });

  });

});
