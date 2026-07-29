import { COMBINED_COURSE_ITEM_TYPES } from '../../../../../src/quest/domain/constants.js';
import { AdminCombinedCourseBlueprintDetails } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/AdminCombinedCourseBlueprintDetails.js';
import { Quest, REQUIREMENT_TYPES } from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import { adminCombinedCourseBlueprintDetailsSerializer } from '../../../../../src/quest/infrastructure/serializers/admin-combined-course-blueprint-details-serializer.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

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

    // constructing whole framework
    const tube = domainBuilder.buildTube({
      id: 'tubeA',
      name: 'testTubeName',
      practicalTitle: 'testTubePracticalTitle',
    });
    const thematic = domainBuilder.buildThematic({
      competenceId: 'competence1',
      tubeIds: ['tubeA'],
      tubes: [tube],
    });
    const cappedTube = { id: 'ABC', level: 4 };
    thematic.tubes = [
      { id: cappedTube.id, level: cappedTube.level, name: tube.name, practicalTitle: tube.practicalTitle },
    ];

    const competence = domainBuilder.buildCompetence({
      id: 'competence1',
      areaId: 'area1',
      thematics: [thematic],
      tubes: [tube],
    });
    const area = domainBuilder.buildArea({
      id: 'area1',
      competences: [competence],
    });

    const adminCombinedCourseBlueprintDetails = new AdminCombinedCourseBlueprintDetails({
      id: 1,
      name: 'Mon parcours',
      internalName: 'Mon modèle de parcours',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      illustration: '/illustrations/image.svg',
      content: [
        {
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          value: 'mon-module',
          shortId: 'short-mon-module',
        },
        { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: 123 },
      ],
      attestationLabel: '6ème',
      surveyLink: 'survey-link-test',
      rewardRequirementsDescription: 'description of requirements',
      organizationIds: [],
      rewardRequirements: [
        {
          id: 'reward-requirements-1',
          areas: [area],
          cappedTubesThreshold: '50',
        },
      ],
      quest,
    });

    // when
    // console.log(adminCombinedCourseBlueprintDetails);
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
            {
              type: COMBINED_COURSE_ITEM_TYPES.MODULE,
              value: 'mon-module',
              shortId: 'short-mon-module',
            },
            { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: 123 },
          ],
          'created-at': adminCombinedCourseBlueprintDetails.createdAt,
          'updated-at': adminCombinedCourseBlueprintDetails.updatedAt,
          'attestation-label': '6ème',
          'survey-link': 'survey-link-test',
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
            level: cappedTube.level,
            name: tube.name,
            'practical-title': tube.practicalTitle,
          },
          id: cappedTube.id,
          type: 'tubes',
        },
        {
          attributes: {
            index: 0,
            name: thematic.name,
          },
          id: thematic.id,
          relationships: {
            tubes: {
              data: [
                {
                  id: cappedTube.id,
                  type: 'tubes',
                },
              ],
            },
          },
          type: 'thematics',
        },
        {
          attributes: {
            index: '1.1',
            name: 'Manger des fruits',
          },
          id: competence.id,
          relationships: {
            thematics: {
              data: [
                {
                  id: thematic.id,
                  type: 'thematics',
                },
              ],
            },
          },
          type: 'competences',
        },
        {
          attributes: {
            code: '5',
            color: 'red',
            title: 'Super domaine',
          },
          id: area.id,
          relationships: {
            competences: {
              data: [
                {
                  id: competence.id,
                  type: 'competences',
                },
              ],
            },
          },
          type: 'areas',
        },
        {
          attributes: {
            'capped-tubes-threshold': '50',
          },
          id: 'reward-requirements-1',
          relationships: {
            areas: {
              data: [
                {
                  id: area.id,
                  type: 'areas',
                },
              ],
            },
          },
          type: 'rewardRequirements',
        },
      ],
    });
  });
});
