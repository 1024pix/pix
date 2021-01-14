const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/target-profile-with-learning-content-serializer');
const TargetProfileWithLearningContent = require('../../../../../lib/domain/models/TargetProfileWithLearningContent');

describe('Unit | Serializer | JSONAPI | target-profile-with-learning-content-serializer', function() {

  describe('#serialize', function() {

    it('should serialize target profile to JSONAPI', function() {
      // given
      const targetProfileWithLearningContent = new TargetProfileWithLearningContent({
        id: 132,
        name: 'Les compétences de BRO 2.0',
        outdated: true,
        isPublic: false,
        ownerOrganizationId: 12,
        skills: [{ id: 'rec1', name: '@url4' }],
        tubes: [{ id: 'rec2', name: 'Url' }],
        competences: [{ id: 'rec3', name: 'Comprendre' }],
        areas: [{ id: 'rec4', name: 'Connaître' }],
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
          },
          relationships: {
            skills: {
              data: [{
                id: targetProfileWithLearningContent.skills[0].id.toString(),
                type: 'skills',
              }],
            },
            badges: {
              links: {
                related: `/api/admin/target-profiles/${targetProfileWithLearningContent.id}/badges`,
              },
            },
          },
        },
        included: [{
          id: targetProfileWithLearningContent.skills[0].id.toString(),
          type: 'skills',
          attributes: {
            name: targetProfileWithLearningContent.skills[0].name,
          },
        }],
      };

      // when
      const serializedTargetProfile = serializer.serialize(targetProfileWithLearningContent);

      // then
      return expect(serializedTargetProfile).to.deep.equal(expectedTargetProfile);
    });
  });
});
