const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/target-profile-with-learning-content-serializer');
const TargetProfileWithLearningContent = require('../../../../../lib/domain/models/TargetProfileWithLearningContent');
const TargetProfileTube = require('../../../../../lib/domain/models/TargetProfileTube');
const domainBuilder = require('../../../../tooling/domain-builder/factory');

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
        skills: [domainBuilder.buildTargetedSkill({ id: 'rec1', name: '@url4', tubeId: 'rec2' })],
        tubes: [domainBuilder.buildTargetedTube({ id: 'rec2', practicalTitle: 'Url', competenceId: 'rec3' })],
        competences: [
          domainBuilder.buildTargetedCompetence({ id: 'rec3', name: 'Comprendre', areaId: 'rec4', index: '1.1' }),
        ],
        areas: [
          domainBuilder.buildTargetedArea({ id: 'rec4', title: 'Connaître', color: 'blue', frameworkId: 'fmkId1' }),
        ],
        organizations: [{ id: 42 }],
        category: 'OTHER',
        isSimplifiedAccess: false,
        tubesSelection: [
          new TargetProfileTube({ id: 'tubeId1', level: 6 }),
          new TargetProfileTube({ id: 'tubeId2', level: 3 }),
        ],
        tubesSelectionAreas: [
          domainBuilder.buildTargetedArea({
            id: 'rec4',
            title: 'Connaître',
            color: 'blue',
            code: 'areaCode4',
            competences: [
              domainBuilder.buildTargetedCompetence({
                id: 'rec3',
                name: 'Comprendre',
                index: '1.1',
                thematics: [
                  domainBuilder.buildTargetedThematic({
                    id: 'idThematic1',
                    name: 'La cuisine',
                    index: '1',
                    tubes: [
                      domainBuilder.buildTargetedTube({
                        id: 'rec2',
                        practicalTitle: 'Url',
                        practicalDescription: 'Uniform Resource Locator',
                        level: 5,
                        challenges: [
                          domainBuilder.buildChallenge({ responsive: ['Smartphone'] }),
                          domainBuilder.buildChallenge({ responsive: ['Smartphone', 'Tablet'] }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
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
            'tubes-selection-areas': {
              data: [
                {
                  id: targetProfileWithLearningContent.tubesSelectionAreas[0].id,
                  type: 'areas',
                },
              ],
            },
            skills: {
              data: [
                {
                  id: targetProfileWithLearningContent.skills[0].id,
                  type: 'skills',
                },
              ],
            },
            tubes: {
              data: [
                {
                  id: targetProfileWithLearningContent.tubes[0].id,
                  type: 'tubes',
                },
              ],
            },
            competences: {
              data: [
                {
                  id: targetProfileWithLearningContent.competences[0].id,
                  type: 'competences',
                },
              ],
            },
            areas: {
              data: [
                {
                  id: targetProfileWithLearningContent.areas[0].id,
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
            id: targetProfileWithLearningContent.skills[0].id,
            type: 'skills',
            attributes: {
              name: targetProfileWithLearningContent.skills[0].name,
              'tube-id': targetProfileWithLearningContent.skills[0].tubeId,
              difficulty: 4,
            },
          },
          {
            id: targetProfileWithLearningContent.tubes[0].id,
            type: 'tubes',
            attributes: {
              'practical-title': targetProfileWithLearningContent.tubes[0].practicalTitle,
              'competence-id': targetProfileWithLearningContent.tubes[0].competenceId,
              level: targetProfileWithLearningContent.tubesSelectionAreas[0].competences[0].thematics[0].tubes[0].level,
              'practical-description':
                targetProfileWithLearningContent.tubesSelectionAreas[0].competences[0].thematics[0].tubes[0]
                  .practicalDescription,
              mobile:
                targetProfileWithLearningContent.tubesSelectionAreas[0].competences[0].thematics[0].tubes[0].mobile,
            },
            relationships: {},
          },
          {
            id: targetProfileWithLearningContent.competences[0].id,
            type: 'competences',
            attributes: {
              name: targetProfileWithLearningContent.competences[0].name,
              'area-id': targetProfileWithLearningContent.competences[0].areaId,
              index: targetProfileWithLearningContent.competences[0].index,
            },
            relationships: {
              thematics: {
                data: [
                  {
                    id: targetProfileWithLearningContent.tubesSelectionAreas[0].competences[0].thematics[0].id,
                    type: 'thematics',
                  },
                ],
              },
            },
          },
          {
            id: targetProfileWithLearningContent.areas[0].id,
            type: 'areas',
            attributes: {
              title: targetProfileWithLearningContent.areas[0].title,
              color: targetProfileWithLearningContent.areas[0].color,
              code: targetProfileWithLearningContent.tubesSelectionAreas[0].code,
              'framework-id': targetProfileWithLearningContent.areas[0].frameworkId,
            },
            relationships: {
              competences: {
                data: [
                  {
                    id: targetProfileWithLearningContent.tubesSelectionAreas[0].competences[0].id,
                    type: 'competences',
                  },
                ],
              },
            },
          },
          {
            id: targetProfileWithLearningContent.tubesSelectionAreas[0].competences[0].thematics[0].id,
            type: 'thematics',
            attributes: {
              name: targetProfileWithLearningContent.tubesSelectionAreas[0].competences[0].thematics[0].name,
              index: targetProfileWithLearningContent.tubesSelectionAreas[0].competences[0].thematics[0].index,
            },
            relationships: {
              tubes: {
                data: [
                  {
                    id: targetProfileWithLearningContent.tubesSelectionAreas[0].competences[0].thematics[0].tubes[0].id,
                    type: 'tubes',
                  },
                ],
              },
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
