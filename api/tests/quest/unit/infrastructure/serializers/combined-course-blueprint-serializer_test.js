import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/CombinedCourseBlueprint.js';
import * as combinedCourseBlueprintSerializer from '../../../../../src/quest/infrastructure/serializers/combined-course-blueprint-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Serializers | combined-course-blueprint', function () {
  it('#serialize', function () {
    // given
    const combinedCourseBlueprint = new CombinedCourseBlueprint({
      id: 1,
      name: 'Mon parcours',
      internalName: 'Mon modèle de parcours',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      illustration: '/illustrations/image.svg',
      surveyLink: 'survey-link-test',
      organizationIds: [],
    });

    // when
    const serializedCombinedCourseBlueprints = combinedCourseBlueprintSerializer.serialize(combinedCourseBlueprint);

    // then
    expect(serializedCombinedCourseBlueprints).to.deep.equal({
      data: {
        attributes: {
          name: 'Mon parcours',
          'internal-name': 'Mon modèle de parcours',
          illustration: '/illustrations/image.svg',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          'survey-link': 'survey-link-test',
          'created-at': combinedCourseBlueprint.createdAt,
          'updated-at': combinedCourseBlueprint.updatedAt,
        },
        type: 'combined-course-blueprints',
        id: '1',
      },
    });
  });
});
