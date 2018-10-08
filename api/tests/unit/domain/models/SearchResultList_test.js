const { expect } = require('../../../test-helper');
const SearchResultList = require('../../../../lib/domain/models/SearchResultList');

describe('Unit | Domain | Models | SearchResultList', () => {

  describe('#pagesCount', function() {

    [{
      conditions: { totalResults: 0, pageSize: 10 },
      expectations: { pagesCount: 0 }
    }, {
      conditions: { totalResults: 9, pageSize: 10 },
      expectations: { pagesCount: 1 }
    }, {
      conditions: { totalResults: 10, pageSize: 10 },
      expectations: { pagesCount: 1 }
    }, {
      conditions: { totalResults: 11, pageSize: 10 },
      expectations: { pagesCount: 2 }
    }, {
      conditions: { totalResults: 19, pageSize: 10 },
      expectations: { pagesCount: 2 }
    }, {
      conditions: { totalResults: 20, pageSize: 10 },
      expectations: { pagesCount: 2 }
    }, {
      conditions: { totalResults: 21, pageSize: 10 },
      expectations: { pagesCount: 3 }
    }].forEach((testCase) => {

      it(`should return a total of pages equal to ${testCase.expectations.pagesCount} for given total results ${testCase.conditions.totalResults} and page size ${testCase.conditions.pageSize}`, () => {
        // given
        const searchResultList = new SearchResultList({
          totalResults: testCase.conditions.totalResults,
          pageSize: testCase.conditions.pageSize
        });

        // when
        const actual = searchResultList.pagesCount;

        // then
        expect(actual).to.equal(testCase.expectations.pagesCount);
      });
    });
  });
});
