import { expect } from '../../../../../test-helper.js';
import * as serializer from '../../../../../../src/evaluation/infrastructure/serializers/jsonapi/autonomous-course-paginated-list-serializer.js';

describe('Unit | Serializer | JSONAPI | autonomous-course-paginated-list-serializer', function () {
  describe('#serialize', function () {
    it('should serialize an array of autonomous-courses list items', function () {
      const autonomousCoursesList = [
        {
          id: 1,
          name: 'name',
          createdAt: new Date('2017-09-01T12:14:33Z'),
          archivedAt: new Date('2019-09-01T12:14:33Z'),
        },
        {
          id: 2,
          name: 'name',
          createdAt: new Date('2018-09-01T12:14:33Z'),
          archivedAt: new Date('2020-09-01T12:14:33Z'),
        },
      ];

      const meta = { some: 'meta' };

      const expectedResponse = {
        data: [
          {
            type: 'autonomous-course-list-items',
            id: String(autonomousCoursesList[0].id),
            attributes: {
              'archived-at': autonomousCoursesList[0].archivedAt,
              'created-at': autonomousCoursesList[0].createdAt,
              name: autonomousCoursesList[0].name,
            },
          },
          {
            type: 'autonomous-course-list-items',
            id: String(autonomousCoursesList[1].id),
            attributes: {
              'archived-at': autonomousCoursesList[1].archivedAt,
              'created-at': autonomousCoursesList[1].createdAt,
              name: autonomousCoursesList[1].name,
            },
          },
        ],
        meta,
      };

      const serializedResult = serializer.serialize(autonomousCoursesList, meta);

      return expect(serializedResult).to.deep.equal(expectedResponse);
    });
  });
});
