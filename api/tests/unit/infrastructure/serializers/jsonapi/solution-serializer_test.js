const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/solution-serializer');
const Solution = require('../../../../../lib/domain/models/referential/solution');

describe('Unit | Serializer | JSONAPI | solution-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Solution model object into JSON API data', function() {

      const solution = new Solution();
      solution.id = 'solution_id';
      solution.value = 'Solution value';

      // when
      const json = serializer.serialize(solution);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'solutions',
          id: solution.id,
          attributes: {
            value: solution.value
          }
        }
      });
    });

  });

});
