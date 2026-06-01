import { COMBINED_COURSE_ITEM_TYPES } from '../../../../../src/quest/domain/constants.js';
import { AdminCombinedCourseBlueprintDetails } from '../../../../../src/quest/domain/models/AdminCombinedCourseBlueprintDetails.js';
import { Quest } from '../../../../../src/quest/domain/models/Quest.js';
import * as adminCombinedCourseBlueprintDetailsSerializer from '../../../../../src/quest/infrastructure/serializers/admin-combined-course-blueprint-details-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Serializers | admin-combined-course-blueprint-details', function () {
  it('#serialize', function () {
    // given
    const adminCombinedCourseBlueprintDetails = new AdminCombinedCourseBlueprintDetails({
      id: 1,
      name: 'Mon parcours',
      internalName: 'Mon modèle de parcours',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      illustration: '/illustrations/image.svg',
      content: [
        { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: 'mon-module', shortId: 'short-mon-module' },
        { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: 123 },
      ],
      attestationLabel: '6ème',
      surveyLink: 'survey-link-test',
      organizationIds: [],
      quest: new Quest({ eligibilityRequirements: [], successRequirements: [], rewardId: null, rewardType: null }),
    });

    // when
    const serialized = adminCombinedCourseBlueprintDetailsSerializer.serialize(adminCombinedCourseBlueprintDetails);

    // then
    expect(serialized).to.deep.equal({
      data: {
        attributes: {
          name: 'Mon parcours',
          'internal-name': 'Mon modèle de parcours',
          illustration: '/illustrations/image.svg',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          content: [
            { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: 'mon-module', shortId: 'short-mon-module' },
            { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: 123 },
          ],
          'created-at': adminCombinedCourseBlueprintDetails.createdAt,
          'updated-at': adminCombinedCourseBlueprintDetails.updatedAt,
          'attestation-label': '6ème',
          'survey-link': 'survey-link-test',
        },
        type: 'combined-course-blueprints',
        id: '1',
      },
    });
  });
});
