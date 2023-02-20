import { expect } from 'chai';
import { paginate } from '../../../../lib/infrastructure/utils/paginate';

describe('Unit | Utils | paginate', function () {
  describe('#paginate', function () {
    context('when there is no data', function () {
      it('should paginate', function () {
        // Given
        const data = [];
        const expectedResult = {
          results: [],
          pagination: {
            page: 1,
            pageSize: 10,
            rowCount: 0,
            pageCount: 0,
          },
        };

        // When
        const paginatedResults = paginate(data);

        // Then
        expect(paginatedResults).to.deep.equal(expectedResult);
      });
    });

    context('when there is one row of data', function () {
      it('should paginate', function () {
        // Given
        const data = [
          {
            test: 'test',
          },
        ];
        const expectedResult = {
          results: data,
          pagination: {
            page: 1,
            pageSize: 10,
            rowCount: 1,
            pageCount: 1,
          },
        };

        // When
        const paginatedResults = paginate(data);

        // Then
        expect(paginatedResults).to.deep.equal(expectedResult);
      });

      it('should paginate for more than 10 rows', function () {
        // Given
        const data = _buildTestData(11);

        const expectedResult = {
          results: data.slice(0, 10),
          pagination: {
            page: 1,
            pageSize: 10,
            rowCount: 11,
            pageCount: 2,
          },
        };

        // When
        const paginatedResults = paginate(data);

        // Then
        expect(paginatedResults).to.deep.equal(expectedResult);
      });

      it('should return second page for more than 10 rows', function () {
        // Given
        const data = _buildTestData(11);
        const page = {
          number: 2,
          size: 10,
        };
        const expectedResult = {
          results: data.slice(10),
          pagination: {
            page: 2,
            pageSize: 10,
            rowCount: 11,
            pageCount: 2,
          },
        };

        // When
        const paginatedResults = paginate(data, page);

        // Then
        expect(paginatedResults).to.deep.equal(expectedResult);
      });
    });

    context('when page number is lower than 1', function () {
      it('should return first page', function () {
        // Given
        const data = _buildTestData(3);
        const page = { number: -2 };

        const expectedResult = {
          results: data,
          pagination: {
            page: 1,
            pageSize: 10,
            rowCount: 3,
            pageCount: 1,
          },
        };

        // When
        const paginatedResults = paginate(data, page);

        // Then
        expect(paginatedResults).to.deep.equal(expectedResult);
      });
    });

    context('when page number is greater than page count', function () {
      it('should return last page', function () {
        // Given
        const data = _buildTestData(3);
        const page = { number: 3, size: 2 };

        const expectedResult = {
          results: data.slice(2),
          pagination: {
            page: 2,
            pageSize: 2,
            rowCount: 3,
            pageCount: 2,
          },
        };

        // When
        const paginatedResults = paginate(data, page);

        // Then
        expect(paginatedResults).to.deep.equal(expectedResult);
      });
    });
  });
});

function _buildTestData(count) {
  return Array.from({ length: count }, (_, i) => ({ [`attribute${i}`]: `value${i}` }));
}
