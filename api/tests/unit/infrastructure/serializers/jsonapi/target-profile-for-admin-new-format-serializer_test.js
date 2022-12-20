const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/target-profile-for-admin-new-format-serializer');
const TargetProfileForAdminNewFormat = require('../../../../../lib/domain/models/TargetProfileForAdminNewFormat');
const { SCOPES } = require('../../../../../lib/domain/models/BadgeDetails');

describe('Unit | Serializer | JSONAPI | target-profile-for-admin-new-format-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile new format to JSONAPI', function () {
      // given
      const badge1Criteria1 = domainBuilder.buildBadgeDetails.buildBadgeCriterion_SkillSets({
        id: 1000,
        threshold: 80,
        arrayOfSkillIds: [['rec123', 'recABC'], ['rec456']],
      });
      const badge1Criteria2 = domainBuilder.buildBadgeDetails.buildBadgeCriterion_CampaignParticipation({
        id: 2000,
        threshold: 70,
      });
      const badge1 = domainBuilder.buildBadgeDetails({
        id: 100,
        altMessage: 'some altMessage badge1',
        imageUrl: 'some imageUrl badge1',
        message: 'some message badge1',
        title: 'some title badge1',
        key: 'some key badge1',
        isCertifiable: true,
        isAlwaysVisible: false,
        criteria: [badge1Criteria1, badge1Criteria2],
      });
      const badge2Criteria1 = domainBuilder.buildBadgeDetails.buildBadgeCriterion_CappedTubes({
        name: 'super tubes group',
        id: 3000,
        threshold: 50,
        cappedTubesDTO: [
          { tubeId: 'tube1', level: 2 },
          { tubeId: 'tube2', level: 8 },
        ],
      });
      const badge2 = domainBuilder.buildBadgeDetails({
        id: 200,
        altMessage: 'some altMessage badge2',
        imageUrl: 'some imageUrl badge2',
        message: 'some message badge2',
        title: 'some title badge2',
        key: 'some key badge2',
        isCertifiable: false,
        isAlwaysVisible: true,
        criteria: [badge2Criteria1],
      });
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
        badges: [badge1, badge2],
        areas: [area, area2],
        competences: [
          domainBuilder.buildCompetence({
            id: 'recComp1',
            area,
            areaId: area.id,
            name: 'Super compétence',
            index: '1.1',
          }),
          domainBuilder.buildCompetence({
            id: 'recComp2',
            area: area2,
            areaId: area2.id,
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
              isMobileCompliant: true,
              isTabletCompliant: false,
            }),
            thematicId: 'recThem1',
            level: 7,
          },
          {
            ...domainBuilder.buildTube({
              id: 'recTube2',
              name: '@nomTube2',
              practicalTitle: 'Super tube2',
              isMobileCompliant: true,
              isTabletCompliant: false,
            }),
            thematicId: 'recThem2',
            level: 4,
          },
          {
            ...domainBuilder.buildTube({
              id: 'recTube3',
              name: '@nomTube3',
              practicalTitle: 'Super tube3',
              isMobileCompliant: true,
              isTabletCompliant: false,
            }),
            thematicId: 'recThem2',
            level: 6,
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
            stages: {
              links: {
                related: '/api/admin/target-profiles/132/stages',
              },
            },
            badges: {
              data: [
                {
                  type: 'badges',
                  id: '100',
                },
                {
                  type: 'badges',
                  id: '200',
                },
              ],
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
            type: 'badge-criteria',
            id: '1000',
            attributes: {
              name: null,
              threshold: 80,
              scope: SCOPES.SKILL_SET,
              'skill-sets': [
                {
                  name: 'skillSetName#rec123',
                  skillIds: ['rec123', 'recABC'],
                },
                {
                  name: 'skillSetName#rec456',
                  skillIds: ['rec456'],
                },
              ],
              'capped-tubes': [],
            },
          },
          {
            type: 'badge-criteria',
            id: '2000',
            attributes: {
              name: null,
              threshold: 70,
              scope: SCOPES.CAMPAIGN_PARTICIPATION,
              'skill-sets': [],
              'capped-tubes': [],
            },
          },
          {
            type: 'badges',
            id: '100',
            attributes: {
              'alt-message': 'some altMessage badge1',
              'image-url': 'some imageUrl badge1',
              message: 'some message badge1',
              title: 'some title badge1',
              key: 'some key badge1',
              'is-certifiable': true,
              'is-always-visible': false,
            },
            relationships: {
              criteria: {
                data: [
                  {
                    type: 'badge-criteria',
                    id: '1000',
                  },
                  {
                    type: 'badge-criteria',
                    id: '2000',
                  },
                ],
              },
            },
          },
          {
            type: 'badge-criteria',
            id: '3000',
            attributes: {
              name: 'super tubes group',
              threshold: 50,
              scope: SCOPES.CAPPED_TUBES,
              'skill-sets': [],
              'capped-tubes': [
                { tubeId: 'tube1', level: 2 },
                { tubeId: 'tube2', level: 8 },
              ],
            },
          },
          {
            type: 'badges',
            id: '200',
            attributes: {
              'alt-message': 'some altMessage badge2',
              'image-url': 'some imageUrl badge2',
              message: 'some message badge2',
              title: 'some title badge2',
              key: 'some key badge2',
              'is-certifiable': false,
              'is-always-visible': true,
            },
            relationships: {
              criteria: {
                data: [
                  {
                    type: 'badge-criteria',
                    id: '3000',
                  },
                ],
              },
            },
          },
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
