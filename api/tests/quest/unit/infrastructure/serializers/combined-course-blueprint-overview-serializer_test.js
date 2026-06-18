import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { Quest } from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import * as combinedCourseBlueprintOverviewSerializer from '../../../../../src/quest/infrastructure/serializers/combined-course-blueprint-overview-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Serializers | combined-course-blueprint-overview', function () {
  it('#serialize', function () {
    // given
    const quest = new Quest({
      eligibilityRequirements: [],
      successRequirements: [],
    });
    const combinedCourseBlueprint = new CombinedCourseBlueprint({
      id: 1,
      name: 'Mon parcours',
      internalName: 'Mon modèle de parcours',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      illustration: '/illustrations/image.svg',
      quest,
    });
    combinedCourseBlueprint.items = [
      { id: 1, name: 'Diagnostic' },
      {
        id: 2,
        name: 'Module 1',
        duration: 1,
        image: '/image.png',
        isRecommendable: true,
      },
      {
        id: 3,
        name: 'Module 2',
        duration: 2,
        image: '/image.png',
        isRecommendable: false,
      },
    ];

    // when
    const serializedCombinedCourseBlueprintOverview =
      combinedCourseBlueprintOverviewSerializer.serialize(combinedCourseBlueprint);

    // then
    expect(serializedCombinedCourseBlueprintOverview).to.deep.equal({
      data: {
        attributes: {
          name: 'Mon parcours',
          'internal-name': 'Mon modèle de parcours',
          illustration: '/illustrations/image.svg',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          'created-at': combinedCourseBlueprint.createdAt,
          'updated-at': combinedCourseBlueprint.updatedAt,
        },
        type: 'combined-course-blueprint-overview',
        id: '1',
        relationships: {
          items: {
            data: [
              {
                id: '1',
                type: 'combined-course-blueprint-items',
              },
              {
                id: '2',
                type: 'combined-course-blueprint-items',
              },
              {
                id: '3',
                type: 'combined-course-blueprint-items',
              },
            ],
          },
        },
      },
      included: [
        {
          id: '1',
          type: 'combined-course-blueprint-items',
          attributes: {
            name: 'Diagnostic',
          },
        },
        {
          id: '2',
          type: 'combined-course-blueprint-items',
          attributes: {
            duration: 1,
            image: '/image.png',
            name: 'Module 1',
            'is-recommendable': true,
          },
        },
        {
          id: '3',
          type: 'combined-course-blueprint-items',
          attributes: {
            duration: 2,
            image: '/image.png',
            name: 'Module 2',
            'is-recommendable': false,
          },
        },
      ],
    });
  });
});
