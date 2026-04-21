import {
  ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS,
  AdminCombinedCourseBlueprint,
} from '../../../../../src/quest/domain/models/AdminCombinedCourseBlueprint.js';
import * as adminCombinedCourseBlueprintSerializer from '../../../../../src/quest/infrastructure/serializers/admin-combined-course-blueprint-serializer.js';

describe('Quest | Unit | Infrastructure | Serializers | admin-combined-course-blueprint', function () {
  it('#serialize', function () {
    // given
    const adminCombinedCourseBlueprint = new AdminCombinedCourseBlueprint({
      id: 1,
      name: 'Mon parcours',
      internalName: 'Mon modèle de parcours',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      illustration: '/illustrations/image.svg',
      content: AdminCombinedCourseBlueprint.buildContentItems([
        { moduleShortId: 'mon-module' },
        { targetProfileId: 123 },
      ]),
      attestationKey: 'SIXTH_GRADE',
      attestationLabel: '6ème',
      organizationIds: [],
    });

    // when
    const serializedCombinedCourseBlueprint =
      adminCombinedCourseBlueprintSerializer.serialize(adminCombinedCourseBlueprint);

    // then
    expect(serializedCombinedCourseBlueprint).to.deep.equal({
      data: {
        attributes: {
          name: 'Mon parcours',
          'internal-name': 'Mon modèle de parcours',
          illustration: '/illustrations/image.svg',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          content: [
            {
              type: ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE,
              value: 'mon-module',
            },
            {
              type: ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION,
              value: 123,
            },
          ],
          'created-at': adminCombinedCourseBlueprint.createdAt,
          'updated-at': adminCombinedCourseBlueprint.updatedAt,
          'attestation-label': '6ème',
        },
        type: 'combined-course-blueprints',
        id: '1',
      },
    });
  });

  it('#deserialize', async function () {
    const date = new Date();
    // given
    const serializedBlueprint = {
      data: {
        attributes: {
          name: 'Mon parcours',
          'internal-name': 'Mon modèle de parcours',
          illustration: '/illustrations/image.svg',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          'attestation-key': 'SIXTH_GRADE',
          content: [
            {
              type: 'passages',
              value: 'mon-module',
            },
            {
              type: 'campaignParticipations',
              value: 123,
            },
          ],
          'created-at': date,
          'updated-at': date,
        },
        type: 'combined-course-blueprints',
        id: '1',
      },
    };

    // when
    const deserialize = await adminCombinedCourseBlueprintSerializer.deserialize(serializedBlueprint);

    // then
    expect(deserialize).deep.equal({
      id: '1',
      name: 'Mon parcours',
      internalName: 'Mon modèle de parcours',
      illustration: '/illustrations/image.svg',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      content: [
        {
          type: 'passages',
          value: 'mon-module',
        },
        {
          type: 'campaignParticipations',
          value: 123,
        },
      ],
      attestationKey: 'SIXTH_GRADE',
      attestationLabel: undefined,
      organizationIds: [],
      createdAt: date,
      updatedAt: date,
    });
  });
});
