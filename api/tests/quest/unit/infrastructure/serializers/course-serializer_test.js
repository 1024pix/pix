import { COURSE_ITEM_TYPES, CourseItem } from '../../../../../src/quest/domain/models/CourseItem.js';
import * as courseSerializer from '../../../../../src/quest/infrastructure/serializers/course-serializer.js';

describe('Quest | Unit | Infrastructure | Serializers | course', function () {
  describe('#serialize', function () {
    it('serializes an array of CourseItems', function () {
      // given
      const courseItems = [
        new CourseItem({
          id: 1,
          name: 'Blueprint A',
          type: COURSE_ITEM_TYPES.BLUEPRINT,
          nbTubes: 7,
          nbModules: 3,
          category: null,
          isSimplifiedAccess: null,
          areas: ['Information et données'],
          competences: ['Mener une recherche'],
        }),
        new CourseItem({
          id: 2,
          name: 'Profil cible B',
          type: COURSE_ITEM_TYPES.TARGET_PROFILE,
          nbTubes: 5,
          category: 'PREDEFINED',
          isSimplifiedAccess: true,
          areas: ['Information et données'],
          competences: ['Mener une recherche'],
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
              areas: ['Information et données'],
              competences: ['Mener une recherche'],
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
              areas: ['Information et données'],
              competences: ['Mener une recherche'],
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
