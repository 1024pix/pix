import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/target-profile-for-admin-old-format-serializer';
import TargetProfileForAdminOldFormat from '../../../../../lib/domain/models/TargetProfileForAdminOldFormat';
import { SCOPES } from '../../../../../lib/domain/models/BadgeDetails';

describe('Unit | Serializer | JSONAPI | target-profile-for-admin-old-format-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile old format to JSONAPI', function () {
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
        badges: [badge1, badge2],
        areas: [area],
        competences: [
          domainBuilder.buildCompetence({
            id: 'recComp1',
            area,
            areaId: area.id,
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
            type: 'badge-criteria',
            id: '1000',
            attributes: {
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
