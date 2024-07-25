import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/target-profile-for-admin-serializer.js';
import { TargetProfileForAdmin } from '../../../../../src/shared/domain/models/index.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | target-profile-for-admin-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile to JSONAPI', function () {
      // given
      const badge1Criteria1 = domainBuilder.buildBadgeDetails.buildBadgeCriterion_CampaignParticipation({
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
        criteria: [badge1Criteria1],
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
      const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
        id: 132,
        maxLevel: 5,
        stages: [
          {
            id: 500,
            level: 4,
            threshold: null,
            isFirstSkill: false,
            title: 'titre 500',
            message: 'message 500',
            prescriberTitle: 'titre prescripteur 500',
            prescriberDescription: 'description prescripteur 500',
          },
          {
            id: 501,
            level: 5,
            threshold: null,
            isFirstSkill: false,
            title: 'titre 501',
            message: 'message 501',
            prescriberTitle: 'titre prescripteur 501',
            prescriberDescription: 'description prescripteur 501',
          },
          {
            id: 502,
            level: null,
            threshold: null,
            isFirstSkill: true,
            title: 'titre 502',
            message: 'message 502',
            prescriberTitle: 'titre prescripteur 502',
            prescriberDescription: 'description prescripteur 502',
          },
        ],
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
      const targetProfile = new TargetProfileForAdmin({
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
        areKnowledgeElementsResettable: false,
        hasLinkedCampaign: false,
        hasLinkedAutonomousCourse: false,
        badges: [badge1, badge2],
        stageCollection,
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
              skillIds: ['recSkill1'],
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
        skills: [
          {
            id: 'recSkill1',
            difficulty: 1,
            tubeId: 'recTube1',
          },
        ],
      });

      const expectedSerializedTargetProfile = {
        data: {
          type: 'target-profiles',
          id: '132',
          attributes: {
            category: 'OTHER',
            comment: 'commentaire',
            'created-at': new Date('2021-03-02'),
            description: 'Un super profil cible',
            'image-url': 'some/image/url',
            'is-public': true,
            'is-simplified-access': true,
            'are-knowledge-elements-resettable': false,
            'max-level': 7,
            name: 'Mon Super profil cible',
            outdated: true,
            'owner-organization-id': 12,
            'has-linked-campaign': false,
            'has-linked-autonomous-course': false,
            'capped-tubes': [
              {
                id: 'recTube1',
                level: 7,
              },
              {
                id: 'recTube2',
                level: 4,
              },
              {
                id: 'recTube3',
                level: 6,
              },
            ],
          },
          relationships: {
            areas: {
              data: [
                {
                  id: 'recArea1',
                  type: 'areas',
                },
                {
                  id: 'recArea2',
                  type: 'areas',
                },
              ],
            },
            badges: {
              data: [
                {
                  id: '100',
                  type: 'badges',
                },
                {
                  id: '200',
                  type: 'badges',
                },
              ],
            },
            'stage-collection': {
              data: {
                id: '132',
                type: 'stageCollections',
              },
            },
          },
        },
        included: [
          {
            type: 'badge-criteria',
            id: '2000',
            attributes: {
              'capped-tubes': [],
              name: null,
              scope: 'CampaignParticipation',
              threshold: 70,
            },
          },
          {
            type: 'badges',
            id: '100',
            attributes: {
              'alt-message': 'some altMessage badge1',
              'image-url': 'some imageUrl badge1',
              'is-always-visible': false,
              'is-certifiable': true,
              key: 'some key badge1',
              message: 'some message badge1',
              title: 'some title badge1',
            },
            relationships: {
              criteria: {
                data: [
                  {
                    id: '2000',
                    type: 'badge-criteria',
                  },
                ],
              },
            },
          },
          {
            id: '3000',
            type: 'badge-criteria',
            attributes: {
              'capped-tubes': [
                {
                  level: 2,
                  tubeId: 'tube1',
                },
                {
                  level: 8,
                  tubeId: 'tube2',
                },
              ],
              name: 'super tubes group',
              scope: 'CappedTubes',
              threshold: 50,
            },
          },
          {
            attributes: {
              'alt-message': 'some altMessage badge2',
              'image-url': 'some imageUrl badge2',
              'is-always-visible': true,
              'is-certifiable': false,
              key: 'some key badge2',
              message: 'some message badge2',
              title: 'some title badge2',
            },
            id: '200',
            relationships: {
              criteria: {
                data: [
                  {
                    id: '3000',
                    type: 'badge-criteria',
                  },
                ],
              },
            },
            type: 'badges',
          },
          {
            attributes: {
              level: 4,
              'is-first-skill': false,
              message: 'message 500',
              'prescriber-description': 'description prescripteur 500',
              'prescriber-title': 'titre prescripteur 500',
              threshold: null,
              title: 'titre 500',
            },
            id: '500',
            type: 'stages',
          },
          {
            attributes: {
              level: 5,
              'is-first-skill': false,
              message: 'message 501',
              'prescriber-description': 'description prescripteur 501',
              'prescriber-title': 'titre prescripteur 501',
              threshold: null,
              title: 'titre 501',
            },
            id: '501',
            type: 'stages',
          },
          {
            attributes: {
              level: null,
              'is-first-skill': true,
              message: 'message 502',
              'prescriber-description': 'description prescripteur 502',
              'prescriber-title': 'titre prescripteur 502',
              threshold: null,
              title: 'titre 502',
            },
            id: '502',
            type: 'stages',
          },
          {
            attributes: {
              'target-profile-id': 132,
            },
            id: '132',
            relationships: {
              stages: {
                data: [
                  {
                    id: '500',
                    type: 'stages',
                  },
                  {
                    id: '501',
                    type: 'stages',
                  },
                  {
                    id: '502',
                    type: 'stages',
                  },
                ],
              },
            },
            type: 'stageCollections',
          },
          {
            type: 'skills',
            id: 'recSkill1',
            attributes: {
              difficulty: 1,
            },
          },
          {
            attributes: {
              level: 7,
              mobile: true,
              name: '@nomTube',
              'practical-title': 'Super tube',
              tablet: false,
            },
            relationships: {
              skills: {
                data: [
                  {
                    id: 'recSkill1',
                    type: 'skills',
                  },
                ],
              },
            },
            id: 'recTube1',
            type: 'tubes',
          },
          {
            attributes: {
              index: '5',
              name: 'Super thématique',
            },
            id: 'recThem1',
            relationships: {
              tubes: {
                data: [
                  {
                    id: 'recTube1',
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
              name: 'Super compétence',
            },
            id: 'recComp1',
            relationships: {
              thematics: {
                data: [
                  {
                    id: 'recThem1',
                    type: 'thematics',
                  },
                ],
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              code: 'lyoko',
              color: 'blue',
              'framework-id': 'recFrameworkCool1',
              title: 'Super domaine',
            },
            id: 'recArea1',
            relationships: {
              competences: {
                data: [
                  {
                    id: 'recComp1',
                    type: 'competences',
                  },
                ],
              },
            },
            type: 'areas',
          },
          {
            attributes: {
              level: 4,
              mobile: true,
              name: '@nomTube2',
              'practical-title': 'Super tube2',
              tablet: false,
            },
            relationships: {
              skills: {
                data: [],
              },
            },
            id: 'recTube2',
            type: 'tubes',
          },
          {
            attributes: {
              level: 6,
              mobile: true,
              name: '@nomTube3',
              'practical-title': 'Super tube3',
              tablet: false,
            },
            relationships: {
              skills: {
                data: [],
              },
            },
            id: 'recTube3',
            type: 'tubes',
          },
          {
            attributes: {
              index: '6',
              name: 'Super thématique2',
            },
            id: 'recThem2',
            relationships: {
              tubes: {
                data: [
                  {
                    id: 'recTube2',
                    type: 'tubes',
                  },
                  {
                    id: 'recTube3',
                    type: 'tubes',
                  },
                ],
              },
            },
            type: 'thematics',
          },
          {
            attributes: {
              index: '1.2',
              name: 'Super compétence2',
            },
            id: 'recComp2',
            relationships: {
              thematics: {
                data: [
                  {
                    id: 'recThem2',
                    type: 'thematics',
                  },
                ],
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              code: 'red',
              color: 'red',
              'framework-id': 'recFrameworkCool1',
              title: 'Super domaine2',
            },
            id: 'recArea2',
            relationships: {
              competences: {
                data: [
                  {
                    id: 'recComp2',
                    type: 'competences',
                  },
                ],
              },
            },
            type: 'areas',
          },
        ],
      };

      // when
      const serializedTargetProfile = serializer.serialize({ targetProfile, filter: null });

      // then
      expect(serializedTargetProfile).to.deep.equal(expectedSerializedTargetProfile);
    });

    describe('when there is a badges filter', function () {
      it('should serialize target profile to JSONAPI', function () {
        // given
        const badge1 = domainBuilder.buildBadgeDetails({
          id: 100,
          title: 'some title badge1',
          isCertifiable: true,
        });
        const badge2 = domainBuilder.buildBadgeDetails({
          id: 200,
          title: 'some title badge2',
          isCertifiable: false,
        });
        const targetProfile = new TargetProfileForAdmin({
          id: 132,
          name: 'Mon Super profil cible',
          badges: [badge1, badge2],
        });

        const expectedSerializedTargetProfile = {
          data: {
            type: 'target-profiles',
            id: '132',
            attributes: {
              name: 'Mon Super profil cible',
            },
            relationships: {
              badges: {
                data: [
                  {
                    id: '100',
                    type: 'badges',
                  },
                ],
              },
            },
          },
          included: [
            {
              type: 'badges',
              id: '100',
              attributes: {
                'is-certifiable': true,
                title: 'some title badge1',
              },
            },
          ],
        };

        // when
        const serializedTargetProfile = serializer.serialize({ targetProfile, filter: { badges: 'certifiable' } });

        // then
        expect(serializedTargetProfile).to.deep.equal(expectedSerializedTargetProfile);
      });
    });
  });
});
