const { expect, describe, it } = require('../../../test-helper');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');

describe('Unit | Utils | Query Params Utils', function() {

  describe('#extractFilters', function() {

    it('should extract a filter from request Object', function() {
      // given
      const request = {
        query : {
          'filter[courseId]' : '26'
        }
      };

      // when
      const result = queryParamsUtils.extractFilters(request);

      // then
      expect(result).to.deep.equal({
        courseId : '26'
      });
    });

    it('should extract multiple filters from request Object', function() {
      // given
      const request = {
        query : {
          'filter[courseId]' : '26',
          'filter[userId]' : '1'
        }
      };

      // when
      const result = queryParamsUtils.extractFilters(request);

      // then
      expect(result).to.deep.equal({
        courseId : '26',
        userId : '1'
      });
    });

  });

});
