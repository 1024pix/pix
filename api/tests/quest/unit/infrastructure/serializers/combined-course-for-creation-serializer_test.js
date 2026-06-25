import { combinedCourseForCreationSerializer } from '../../../../../src/quest/infrastructure/serializers/combined-course-for-creation-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Serializers | combined-course-for-creation', function () {
  it('#deserialize', async function () {
    // given
    const payload = {
      data: {
        attributes: {
          name: 'Mon parcours',
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
    const deserialized = await combinedCourseForCreationSerializer.deserialize(payload);

    // then
    expect(deserialized).deep.equal({
      name: 'Mon parcours',
      organizationId: 123,
      blueprintId: 456,
    });
  });
});
