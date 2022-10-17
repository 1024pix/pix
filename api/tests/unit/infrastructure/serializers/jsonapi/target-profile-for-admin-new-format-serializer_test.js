const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/target-profile-for-admin-new-format-serializer');
const TargetProfileForAdminNewFormat = require('../../../../../lib/domain/models/TargetProfileForAdminNewFormat');

describe('Unit | Serializer | JSONAPI | target-profile-for-admin-new-format-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile new format to JSONAPI', function () {
      // given
      const area = domainBuilder.buildArea({
        id: 'recArea1',
        title: 'Super domaine',
        color: 'blue',
        code: 'lyoko',
        frameworkId: 'recFrameworkCool1',
      });
      const area2 = domainBuilder.buildArea({
        id: 'recArea2',
        title: 'Super domaine2',
        color: 'red',
        code: 'red',
        frameworkId: 'recFrameworkCool1',
      });
      const targetProfileForAdminNewFormat = new TargetProfileForAdminNewFormat({
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
        areas: [area, area2],
        competences: [
          domainBuilder.buildCompetence({
            id: 'recComp1',
            area,
            name: 'Super compétence',
            index: '1.1',
          }),
          domainBuilder.buildCompetence({
            id: 'recComp2',
            area: area2,
            name: 'Super compétence2',
            index: '1.2',
          }),
        ],
        thematics: [
          domainBuilder.buildThematic({
            id: 'recThem1',
            competenceId: 'recComp1',
            name: 'Super thématique',
            index: '5',
          }),
          domainBuilder.buildThematic({
            id: 'recThem2',
            competenceId: 'recComp2',
            name: 'Super thématique2',
            index: '6',
          }),
        ],
        tubes: [
          {
            ...domainBuilder.buildTube({
              id: 'recTube1',
              name: '@nomTube',
              practicalTitle: 'Super tube',
            }),
            thematicId: 'recThem1',
            level: 7,
            mobile: true,
            tablet: false,
          },
          {
            ...domainBuilder.buildTube({
              id: 'recTube2',
              name: '@nomTube2',
              practicalTitle: 'Super tube2',
            }),
            thematicId: 'recThem2',
            level: 4,
            mobile: true,
            tablet: false,
          },
          {
            ...domainBuilder.buildTube({
              id: 'recTube3',
              name: '@nomTube3',
              practicalTitle: 'Super tube3',
            }),
            thematicId: 'recThem2',
            level: 6,
            mobile: true,
            tablet: false,
          },
        ],
      });

      const expectedSerializedTargetProfile = {
        data: {
          type: 'target-profiles',
          id: '132',
          attributes: {
            'is-new-format': true,
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
            'max-level': 7,
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
            'new-areas': {
              data: [
                {
                  type: 'newAreas',
                  id: 'recArea1',
                },
                {
                  type: 'newAreas',
                  id: 'recArea2',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'new-tubes',
            id: 'recTube1',
            attributes: {
              name: '@nomTube',
              'practical-title': 'Super tube',
              level: 7,
              mobile: true,
              tablet: false,
            },
          },
          {
            type: 'new-thematics',
            id: 'recThem1',
            attributes: {
              name: 'Super thématique',
              index: '5',
            },
            relationships: {
              tubes: {
                data: [
                  {
                    type: 'new-tubes',
                    id: 'recTube1',
                  },
                ],
              },
            },
          },
          {
            type: 'new-competences',
            id: 'recComp1',
            attributes: {
              name: 'Super compétence',
              index: '1.1',
            },
            relationships: {
              thematics: {
                data: [
                  {
                    type: 'new-thematics',
                    id: 'recThem1',
                  },
                ],
              },
            },
          },
          {
            type: 'newAreas',
            id: 'recArea1',
            attributes: {
              title: 'Super domaine',
              color: 'blue',
              code: 'lyoko',
              'framework-id': 'recFrameworkCool1',
            },
            relationships: {
              competences: {
                data: [
                  {
                    type: 'new-competences',
                    id: 'recComp1',
                  },
                ],
              },
            },
          },
          {
            type: 'new-tubes',
            id: 'recTube2',
            attributes: {
              name: '@nomTube2',
              'practical-title': 'Super tube2',
              level: 4,
              mobile: true,
              tablet: false,
            },
          },
          {
            type: 'new-tubes',
            id: 'recTube3',
            attributes: {
              name: '@nomTube3',
              'practical-title': 'Super tube3',
              level: 6,
              mobile: true,
              tablet: false,
            },
          },
          {
            type: 'new-thematics',
            id: 'recThem2',
            attributes: {
              name: 'Super thématique2',
              index: '6',
            },
            relationships: {
              tubes: {
                data: [
                  {
                    type: 'new-tubes',
                    id: 'recTube2',
                  },
                  {
                    type: 'new-tubes',
                    id: 'recTube3',
                  },
                ],
              },
            },
          },
          {
            type: 'new-competences',
            id: 'recComp2',
            attributes: {
              name: 'Super compétence2',
              index: '1.2',
            },
            relationships: {
              thematics: {
                data: [
                  {
                    type: 'new-thematics',
                    id: 'recThem2',
                  },
                ],
              },
            },
          },
          {
            type: 'newAreas',
            id: 'recArea2',
            attributes: {
              title: 'Super domaine2',
              color: 'red',
              code: 'red',
              'framework-id': 'recFrameworkCool1',
            },
            relationships: {
              competences: {
                data: [
                  {
                    type: 'new-competences',
                    id: 'recComp2',
                  },
                ],
              },
            },
          },
        ],
      };

      // when
      const serializedTargetProfile = serializer.serialize(targetProfileForAdminNewFormat);

      // then
      expect(serializedTargetProfile).to.deep.equal(expectedSerializedTargetProfile);
    });
  });
});
