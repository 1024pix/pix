import { COMBINED_COURSE_ITEM_TYPES } from '../../../../../src/quest/domain/constants.js';
import { AdminCombinedCourseBlueprintDetails } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/AdminCombinedCourseBlueprintDetails.js';
import { Quest, REQUIREMENT_TYPES } from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import { adminCombinedCourseBlueprintDetailsSerializer } from '../../../../../src/quest/infrastructure/serializers/admin-combined-course-blueprint-details-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Serializers | admin-combined-course-blueprint-details', function () {
  it('#serialize', function () {
    // given
    const quest = new Quest({
      eligibilityRequirements: [],
      successRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.CAPPED_TUBES,
          data: { cappedTubes: [{ tubeId: 'tubeA', level: 1 }], threshold: 100 },
        },
      ],
      rewardId: null,
      rewardType: null,
    });

    const areas = Symbol('areasData');

    const adminCombinedCourseBlueprintDetails = new AdminCombinedCourseBlueprintDetails({
      id: 1,
      name: 'Mon parcours',
      internalName: 'Mon modèle de parcours',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      prescriberDescription: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      illustration: 'http://example.pix/illustrations/image.svg',
      content: [
        {
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          value: 'mon-module',
          shortId: 'short-mon-module',
        },
        { type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: 123 },
      ],
      attestationLabel: '6ème',
      surveyLink: 'http://example.pix/survey-link-test',
      rewardRequirementsDescription: 'description of requirements',
      organizationIds: [],
      rewardRequirements: [
        {
          id: 'reward-requirements-1',
          areas,
          cappedTubesThreshold: '50',
          name: 'requirements group name',
        },
      ],
      quest,
    });

    // when
    const serialized = adminCombinedCourseBlueprintDetailsSerializer.serialize(adminCombinedCourseBlueprintDetails);

    // then
    expect(serialized).to.deep.equal({
      data: {
        attributes: {
          name: 'Mon parcours',
          'internal-name': 'Mon modèle de parcours',
          illustration: 'http://example.pix/illustrations/image.svg',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          'prescriber-description': 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          content: [
            {
              type: COMBINED_COURSE_ITEM_TYPES.MODULE,
              value: 'mon-module',
              shortId: 'short-mon-module',
            },
            { type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: 123 },
          ],
          'created-at': adminCombinedCourseBlueprintDetails.createdAt,
          'updated-at': adminCombinedCourseBlueprintDetails.updatedAt,
          'attestation-label': '6ème',
          'survey-link': 'http://example.pix/survey-link-test',
          'reward-requirements-description': 'description of requirements',
        },
        type: 'combined-course-blueprints',
        id: '1',
        relationships: {
          'reward-requirements': {
            data: [{ id: 'reward-requirements-1', type: 'rewardRequirements' }],
          },
        },
      },
      included: [
        {
          attributes: {
            name: 'requirements group name',
            'capped-tubes-threshold': '50',
            areas: areas,
          },
          id: 'reward-requirements-1',
          type: 'rewardRequirements',
        },
      ],
    });
  });
});
