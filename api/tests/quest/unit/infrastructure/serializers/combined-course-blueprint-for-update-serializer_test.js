import { CombinedCourseBlueprintForUpdate } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/CombinedCourseBlueprintForUpdate.js';
import { combinedCourseBlueprintForUpdateSerializer } from '../../../../../src/quest/infrastructure/serializers/combined-course-blueprint-for-update-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Serializers | combined-course-for-update', function () {
  it('#deserialize', async function () {
    // given
    const payload = {
      data: {
        attributes: {
          name: 'Mon épure',
          internalName: 'Une épure pour tel niveau',
          illustration: 'illustrations/mon-epure.png',
          description: 'Description',
          surveyLink: 'http://www.survey',
        },
        relationships: {
          organization: {
            data: {
              id: 123,
            },
          },
          'combined-course-blueprint': {
            data: {
              id: 456,
            },
          },
        },
      },
    };

    // when
    const deserialized = await combinedCourseBlueprintForUpdateSerializer.deserialize(payload);

    // then
    expect(deserialized).to.be.instanceOf(CombinedCourseBlueprintForUpdate);
    expect(deserialized).deep.equal({
      name: 'Mon épure',
      internalName: 'Une épure pour tel niveau',
      illustration: 'illustrations/mon-epure.png',
      description: 'Description',
      surveyLink: 'http://www.survey',
    });
  });
});
