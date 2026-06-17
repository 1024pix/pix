import {
  COURSE_ITEM_TYPES,
  CourseItem,
} from '../../../../../src/quest/domain/models/combined-courses/value-objects/CourseItem.js';
import * as courseSerializer from '../../../../../src/quest/infrastructure/serializers/course-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Serializers | course', function () {
  describe('#serialize', function () {
    it('serializes an array of CourseItems with areas as JSON API relationships', function () {
      // given
      const area = {
        id: 'recAreaA',
        code: '1',
        title: 'Information et données',
        color: 'jaffa',
        competences: [{ id: 'recCompA', name: 'Mener une recherche', index: '1.1' }],
      };
      const courseItems = [
        new CourseItem({
          id: 1,
          name: 'Blueprint A',
          type: COURSE_ITEM_TYPES.BLUEPRINT,
          nbTubes: 7,
          nbModules: 3,
          category: null,
          isSimplifiedAccess: null,
          areas: [area],
        }),
        new CourseItem({
          id: 2,
          name: 'Profil cible B',
          type: COURSE_ITEM_TYPES.TARGET_PROFILE,
          nbTubes: 5,
          category: 'PREDEFINED',
          isSimplifiedAccess: true,
          areas: [area],
        }),
      ];

      // when
      const serialized = courseSerializer.serialize(courseItems);

      // then
      expect(serialized).to.deep.equal({
        data: [
          {
            id: '1',
            type: 'courses',
            attributes: {
              name: 'Blueprint A',
              type: COURSE_ITEM_TYPES.BLUEPRINT,
              'nb-tubes': 7,
              'nb-modules': 3,
              category: null,
              'is-simplified-access': null,
            },
            relationships: {
              areas: { data: [{ type: 'areas', id: 'recAreaA' }] },
            },
          },
          {
            id: '2',
            type: 'courses',
            attributes: {
              name: 'Profil cible B',
              type: COURSE_ITEM_TYPES.TARGET_PROFILE,
              'nb-tubes': 5,
              'nb-modules': null,
              category: 'PREDEFINED',
              'is-simplified-access': true,
            },
            relationships: {
              areas: { data: [{ type: 'areas', id: 'recAreaA' }] },
            },
          },
        ],
        included: [
          {
            id: 'recCompA',
            type: 'competences',
            attributes: { name: 'Mener une recherche', index: '1.1' },
            relationships: {},
          },
          {
            id: 'recAreaA',
            type: 'areas',
            attributes: { title: 'Information et données', code: '1', color: 'jaffa' },
            relationships: {
              competences: { data: [{ type: 'competences', id: 'recCompA' }] },
            },
          },
        ],
      });
    });

    it('serializes an empty array', function () {
      // when
      const serialized = courseSerializer.serialize([]);

      // then
      expect(serialized).to.deep.equal({ data: [] });
    });
  });
});
