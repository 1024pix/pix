const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/target-profile-for-admin-old-format-serializer');
const TargetProfileForAdminOldFormat = require('../../../../../lib/domain/models/TargetProfileForAdminOldFormat');

describe('Unit | Serializer | JSONAPI | target-profile-for-admin-old-format-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile old format to JSONAPI', function () {
      // given
      const area = domainBuilder.buildArea({
        id: 'recArea1',
        title: 'Super domaine',
        code: 'code area',
        color: 'green',
      });
      const targetProfileForAdminOldFormat = new TargetProfileForAdminOldFormat({
        id: 132,
        name: 'Mon Super profil cible',
        outdated: true,
        isPublic: true,
        createdAt: new Date('2021-03-02'),
        ownerOrganizationId: 12,
        description: 'Un super profil cible',
        comment: 'commentaire',
        imageUrl: 'some/image/url',
        category: 'OTHER',
        isSimplifiedAccess: true,
        areas: [area],
        competences: [
          domainBuilder.buildCompetence({
            id: 'recComp1',
            area,
            name: 'Super compétence',
            index: '2.1',
          }),
        ],
        tubes: [
          domainBuilder.buildTube({
            id: 'recTube1',
            competenceId: 'recComp1',
            practicalTitle: 'Super tube',
          }),
        ],
        skills: [
          domainBuilder.buildSkill({
            id: 'recSkill1',
            tubeId: 'recTube1',
            name: 'skill1',
            difficulty: 1,
          }),
        ],
      });

      const expectedSerializedTargetProfile = {
        data: {
          type: 'target-profiles',
          id: '132',
          attributes: {
            'is-new-format': false,
            name: 'Mon Super profil cible',
            outdated: true,
            'is-public': true,
            'created-at': new Date('2021-03-02'),
            'owner-organization-id': 12,
            description: 'Un super profil cible',
            comment: 'commentaire',
            'image-url': 'some/image/url',
            category: 'OTHER',
            'is-simplified-access': true,
          },
          relationships: {
            badges: {
              links: {
                related: '/api/admin/target-profiles/132/badges',
              },
            },
            stages: {
              links: {
                related: '/api/admin/target-profiles/132/stages',
              },
            },
            'old-areas': {
              data: [
                {
                  type: 'oldAreas',
                  id: 'recArea1',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'old-skills',
            id: 'recSkill1',
            attributes: {
              difficulty: 1,
              name: 'skill1',
            },
          },
          {
            type: 'old-tubes',
            id: 'recTube1',
            attributes: {
              'practical-title': 'Super tube',
            },
            relationships: {
              skills: {
                data: [
                  {
                    type: 'old-skills',
                    id: 'recSkill1',
                  },
                ],
              },
            },
          },
          {
            type: 'old-competences',
            id: 'recComp1',
            attributes: {
              name: 'Super compétence',
              index: '2.1',
            },
            relationships: {
              tubes: {
                data: [
                  {
                    type: 'old-tubes',
                    id: 'recTube1',
                  },
                ],
              },
            },
          },
          {
            type: 'oldAreas',
            id: 'recArea1',
            attributes: {
              title: 'Super domaine',
              code: 'code area',
              color: 'green',
            },
            relationships: {
              competences: {
                data: [
                  {
                    type: 'old-competences',
                    id: 'recComp1',
                  },
                ],
              },
            },
          },
        ],
      };

      // when
      const serializedTargetProfile = serializer.serialize(targetProfileForAdminOldFormat);

      // then
      expect(serializedTargetProfile).to.deep.equal(expectedSerializedTargetProfile);
    });
  });
});
