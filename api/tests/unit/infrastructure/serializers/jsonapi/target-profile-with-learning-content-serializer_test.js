const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/target-profile-with-learning-content-serializer');
const TargetProfileWithLearningContent = require('../../../../../lib/domain/models/TargetProfileWithLearningContent');
const TargetProfileTube = require('../../../../../lib/domain/models/TargetProfileTube');
const buildTargetedSkill = require('../../../../tooling/domain-builder/factory/build-targeted-skill');

describe('Unit | Serializer | JSONAPI | target-profile-with-learning-content-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile to JSONAPI', function () {
      // given
      const targetProfileWithLearningContent = new TargetProfileWithLearningContent({
        id: 132,
        name: 'Les compétences de BRO 2.0',
        outdated: true,
        isPublic: false,
        createdAt: new Date('2021-03-02'),
        ownerOrganizationId: 12,
        description: 'Un super profil cible',
        comment: 'commentaire',
        skills: [buildTargetedSkill({ id: 'rec1', name: '@url4', tubeId: 'rec2' })],
        tubes: [{ id: 'rec2', practicalTitle: 'Url', competenceId: 'rec3' }],
        competences: [{ id: 'rec3', name: 'Comprendre', areaId: 'rec4', index: '1.1' }],
        areas: [{ id: 'rec4', title: 'Connaître', color: 'blue' }],
        organizations: [{ id: 42 }],
        category: 'OTHER',
        isSimplifiedAccess: false,
        tubesSelection: [
          new TargetProfileTube({ id: 'tubeId1', level: 6 }),
          new TargetProfileTube({ id: 'tubeId2', level: 3 }),
        ],
      });

      const expectedTargetProfile = {
        data: {
          id: targetProfileWithLearningContent.id.toString(),
          type: 'target-profiles',
          attributes: {
            name: targetProfileWithLearningContent.name,
            outdated: targetProfileWithLearningContent.outdated,
            description: targetProfileWithLearningContent.description,
            comment: targetProfileWithLearningContent.comment,
            'is-public': targetProfileWithLearningContent.isPublic,
            'owner-organization-id': targetProfileWithLearningContent.ownerOrganizationId,
            'image-url': targetProfileWithLearningContent.imageUrl,
            category: targetProfileWithLearningContent.category,
            'created-at': targetProfileWithLearningContent.createdAt,
            'is-simplified-access': targetProfileWithLearningContent.isSimplifiedAccess,
            'tubes-selection': [
              { id: 'tubeId1', level: 6 },
              { id: 'tubeId2', level: 3 },
            ],
          },
          relationships: {
            skills: {
              data: [
                {
                  id: targetProfileWithLearningContent.skills[0].id.toString(),
                  type: 'skills',
                },
              ],
            },
            tubes: {
              data: [
                {
                  id: targetProfileWithLearningContent.tubes[0].id.toString(),
                  type: 'tubes',
                },
              ],
            },
            competences: {
              data: [
                {
                  id: targetProfileWithLearningContent.competences[0].id.toString(),
                  type: 'competences',
                },
              ],
            },
            areas: {
              data: [
                {
                  id: targetProfileWithLearningContent.areas[0].id.toString(),
                  type: 'areas',
                },
              ],
            },
            badges: {
              links: {
                related: `/api/admin/target-profiles/${targetProfileWithLearningContent.id}/badges`,
              },
            },
            stages: {
              links: {
                related: `/api/admin/target-profiles/${targetProfileWithLearningContent.id}/stages`,
              },
            },
          },
        },
        included: [
          {
            id: targetProfileWithLearningContent.skills[0].id.toString(),
            type: 'skills',
            attributes: {
              name: targetProfileWithLearningContent.skills[0].name,
              'tube-id': targetProfileWithLearningContent.skills[0].tubeId,
              difficulty: 4,
            },
          },
          {
            id: targetProfileWithLearningContent.tubes[0].id.toString(),
            type: 'tubes',
            attributes: {
              'practical-title': targetProfileWithLearningContent.tubes[0].practicalTitle,
              'competence-id': targetProfileWithLearningContent.tubes[0].competenceId,
            },
          },
          {
            id: targetProfileWithLearningContent.competences[0].id.toString(),
            type: 'competences',
            attributes: {
              name: targetProfileWithLearningContent.competences[0].name,
              'area-id': targetProfileWithLearningContent.competences[0].areaId,
              index: targetProfileWithLearningContent.competences[0].index,
            },
          },
          {
            id: targetProfileWithLearningContent.areas[0].id.toString(),
            type: 'areas',
            attributes: {
              title: targetProfileWithLearningContent.areas[0].title,
              color: targetProfileWithLearningContent.areas[0].color,
            },
          },
        ],
      };

      // when
      const serializedTargetProfile = serializer.serialize(targetProfileWithLearningContent);

      // then
      expect(serializedTargetProfile).to.deep.equal(expectedTargetProfile);
    });
  });
});
