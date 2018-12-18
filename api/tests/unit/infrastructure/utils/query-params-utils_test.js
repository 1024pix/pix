const { expect, } = require('../../../test-helper');
const { extractParameters } = require('../../../../lib/infrastructure/utils/query-params-utils');

describe('Unit | Utils | Query Params Utils', function() {

  describe('#extractFilters', function() {

    it('should extract multiple filters from request Object', function() {
      // given
      const query = {
        'filter[courseId]': '26',
        'filter[userId]': '1',
      };

      // when
      const result = extractParameters(query);

      // then
      expect(result).to.deep.equal({
        filter: {
          courseId: '26',
          userId: '1'
        },
        page: {},
        sort: [],
        include: [],
      });
    });

    it('should return an empty object if the request contains no query param "filter"', function() {
      // given
      const query = {
        'page': 1,
        'pageSize': 10
      };

      // when
      const result = extractParameters(query);

      // then
      expect(result).to.deep.equal({
        filter: {},
        page: {},
        sort: [],
        include: [],
      });
    });
  });
});
