import * as combinedCourseDetailsSerializer from '../../../../../src/quest/infrastructure/serializers/combined-course-details-serializer.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Serializers | combined-course-details', function () {
  it('#serialize', function () {
    // given
    const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails();

    // when
    const serializedCombinedCourseDetails = combinedCourseDetailsSerializer.serialize(combinedCourseDetails);

    // then
    expect(serializedCombinedCourseDetails).to.deep.equal({
      data: {
        attributes: {
          name: 'Mon parcours',
          code: 'COMBINIX1',
          'campaign-ids': [1],
        },
        type: 'combined-courses',
        id: '1',
      },
    });
  });
});
