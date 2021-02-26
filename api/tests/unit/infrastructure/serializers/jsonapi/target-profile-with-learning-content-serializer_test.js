const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/target-profile-with-learning-content-serializer');
const TargetProfileWithLearningContent = require('../../../../../lib/domain/models/TargetProfileWithLearningContent');
const buildTargetedSkill = require('../../../../tooling/domain-builder/factory/build-targeted-skill');

describe('Unit | Serializer | JSONAPI | target-profile-with-learning-content-serializer', function() {

  describe('#serialize', function() {

    it('should serialize target profile to JSONAPI', function() {
      // given
      const targetProfileWithLearningContent = new TargetProfileWithLearningContent({
        id: 132,
        name: 'Les compétences de BRO 2.0',
        outdated: true,
        isPublic: false,
        createdAt: new Date('2021-03-02'),
        ownerOrganizationId: 12,
        skills: [buildTargetedSkill({ id: 'rec1', name: '@url4', tubeId: 'rec2' })],
        tubes: [{ id: 'rec2', practicalTitle: 'Url', competenceId: 'rec3' }],
        competences: [{ id: 'rec3', name: 'Comprendre', areaId: 'rec4' }],
        areas: [{ id: 'rec4', title: 'Connaître', color: 'blue' }],
        organizations: [{ id: 42 }],
      });

      const expectedTargetProfile = {
        data: {
          id: targetProfileWithLearningContent.id.toString(),
          type: 'target-profiles',
          attributes: {
            name: targetProfileWithLearningContent.name,
            outdated: targetProfileWithLearningContent.outdated,
            'is-public': targetProfileWithLearningContent.isPublic,
            'owner-organization-id': targetProfileWithLearningContent.ownerOrganizationId,
            'image-url': targetProfileWithLearningContent.imageUrl,
            'created-at': targetProfileWithLearningContent.createdAt,
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
              'name': targetProfileWithLearningContent.competences[0].name,
              'area-id': targetProfileWithLearningContent.competences[0].areaId,
            },
          },
          {
            id: targetProfileWithLearningContent.areas[0].id.toString(),
            type: 'areas',
            attributes: {
              'title': targetProfileWithLearningContent.areas[0].title,
              'color': targetProfileWithLearningContent.areas[0].color,
            },
          },
        ],
      };

      // when
      const serializedTargetProfile = serializer.serialize(targetProfileWithLearningContent);

      // then
      return expect(serializedTargetProfile).to.deep.equal(expectedTargetProfile);
    });
  });
});
