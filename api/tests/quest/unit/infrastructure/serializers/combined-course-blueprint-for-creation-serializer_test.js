import { expect } from 'chai';

import { COMBINED_COURSE_ITEM_TYPES, REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { CombinedCourseBlueprintForCreation } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/CombinedCourseBlueprintForCreation.js';
import { REQUIREMENT_TYPES } from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import { combinedCourseBlueprintForCreationSerializer } from '../../../../../src/quest/infrastructure/serializers/combined-course-blueprint-for-creation-serializer.js';

describe('Quest | Unit | Infrastructure | Serializers | combined-course-blueprint-for-creation-serializer', function () {
  describe('#deserialize', function () {
    const moduleId = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';
    const items = [
      { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: moduleId },
      { type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN, value: 123 },
    ];
    const cappedTubeRequirements = [
      {
        tubes: [
          { level: 1, tubeId: '2ef' },
          { level: 2, tubeId: '3ag' },
        ],
        threshold: 20,
        name: 'requirements group name',
      },
    ];

    function buildSerializedBlueprint(extraAttributes = {}) {
      return {
        data: {
          attributes: {
            name: 'Mon parcours',
            'internal-name': 'Mon modèle de parcours',
            illustration: 'http://example.pix/illustrations/image.svg',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'prescriber-description': 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'reward-id': 5,
            'reward-type': 'ATTESTATION',
            'reward-requirements-description': 'Description of the reward requirements',
            content: items,
            'survey-link': 'http://survey.fr',
            ...extraAttributes,
          },
          type: 'combined-course-blueprints',
          id: '1',
        },
      };
    }

    describe('with capped tube requirements and without schema threshold', function () {
      it('should map the payload attributes to a CombinedCourseBlueprintForCreation', async function () {
        // given
        const serializedBlueprint = buildSerializedBlueprint({
          'capped-tube-requirements': cappedTubeRequirements,
        });

        // when
        const result = await combinedCourseBlueprintForCreationSerializer.deserialize(serializedBlueprint);

        // then
        expect(result).to.deep.equal(
          new CombinedCourseBlueprintForCreation({
            name: 'Mon parcours',
            internalName: 'Mon modèle de parcours',
            illustration: 'http://example.pix/illustrations/image.svg',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            prescriberDescription: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            rewardId: 5,
            rewardType: 'ATTESTATION',
            rewardRequirementsDescription: 'Description of the reward requirements',
            content: items,
            surveyLink: 'http://survey.fr',
            cappedTubeRequirements,
          }),
        );
      });

      it('should build a quest carrying the reward and the capped tube requirements', async function () {
        // given
        const serializedBlueprint = buildSerializedBlueprint({
          'capped-tube-requirements': cappedTubeRequirements,
        });

        // when
        const result = await combinedCourseBlueprintForCreationSerializer.deserialize(serializedBlueprint);

        // then
        expect(result.quest.rewardId).to.equal(5);
        expect(result.quest.rewardType).to.equal(REWARD_TYPES.ATTESTATION);
        expect(result.quest.hasCappedTubeRequirements).to.be.true;
        expect(result.targetProfileIds).to.deep.equal([123]);
        expect(
          result.quest.successRequirements.filter(
            ({ requirement_type }) => requirement_type === REQUIREMENT_TYPES.CAPPED_TUBES,
          ),
        ).to.be.lengthOf(1);
      });
    });

    describe('without capped tube requirements and with a schema threshold', function () {
      it('should keep the schema threshold and build a quest without capped tube requirements', async function () {
        // given
        const serializedBlueprint = buildSerializedBlueprint({ 'schema-threshold': 20 });

        // when
        const result = await combinedCourseBlueprintForCreationSerializer.deserialize(serializedBlueprint);

        // then
        expect(result.schemaThreshold).to.equal(20);
        expect(result.cappedTubeRequirements).to.be.undefined;
        expect(result.quest.hasCappedTubeRequirements).to.equal(false);
        expect(result.needsCappedTubesFromTargetProfiles).to.equal(true);
      });
    });

    describe('without capped tube requirements and without schema threshold', function () {
      it('should build a quest without capped tube requirements', async function () {
        // given
        const serializedBlueprint = buildSerializedBlueprint();

        // when
        const result = await combinedCourseBlueprintForCreationSerializer.deserialize(serializedBlueprint);

        // then
        expect(result.schemaThreshold).to.be.undefined;
        expect(result.quest.hasCappedTubeRequirements).to.equal(false);
        expect(result.needsCappedTubesFromTargetProfiles).to.equal(false);
      });
    });
  });
});
