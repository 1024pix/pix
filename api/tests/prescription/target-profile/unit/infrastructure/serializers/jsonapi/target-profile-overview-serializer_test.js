import { TargetProfileOverview } from '../../../../../../../src/prescription/target-profile/domain/models/TargetProfileOverview.js';
import { targetProfileOverviewSerializer } from '../../../../../../../src/prescription/target-profile/infrastructure/serializers/jsonapi/target-profile-overview-serializer.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';
import { buildThematic } from '../../../../../../tooling/domain-builder/factory/build-thematic.js';

describe('Unit | Serializer | JSONAPI | targetProfileOverview', function () {
  describe('#serialize', function () {
    let framework;
    beforeEach(function () {
      const tubesComp1 = [
        domainBuilder.buildTube({
          id: 'tube1.1',
          skills: [domainBuilder.buildSkill({ difficulty: 2 }), domainBuilder.buildSkill({ difficulty: 1 })],
        }),
      ];
      const tubesComp2 = [
        domainBuilder.buildTube({
          id: 'tube2.1',
          skills: [domainBuilder.buildSkill({ difficulty: 4 }), domainBuilder.buildSkill({ difficulty: 1 })],
        }),
      ];
      framework = domainBuilder.buildFramework({
        id: 'framework1',
        name: 'pix',
        areas: [
          domainBuilder.buildArea({
            id: 'area1',
            competences: [
              domainBuilder.buildCompetence({
                id: 'comp1',
                thematics: [
                  buildThematic({
                    id: 'thematic1',
                    name: 'Ma thématique 1',
                    tubes: tubesComp1,
                  }),
                ],
                tubes: tubesComp1,
              }),
              domainBuilder.buildCompetence({
                id: 'comp2',
                thematics: [
                  buildThematic({
                    id: 'thematic2',
                    name: 'Ma thématique 2',
                    tubes: tubesComp2,
                  }),
                ],
                tubes: tubesComp2,
              }),
            ],
          }),
        ],
      });
    });

    it('should serialize a target profile overview to JSONAPI', function () {
      // given
      const badge = domainBuilder.buildBadge();
      const targetProfile = domainBuilder.buildTargetProfile({
        id: 1,
        name: 'name',
        imageUrl: 'imageUrl',
        category: 'category',
        isSimplifiedAccess: true,
        description: 'description',
        badges: [badge],
      });

      // when
      const serializedTargetProfile = targetProfileOverviewSerializer.serialize(
        new TargetProfileOverview({ ...targetProfile, frameworks: [framework] }),
      );

      //then
      expect(serializedTargetProfile).deep.equal({
        data: {
          id: '1',
          type: 'target-profile-overviews',
          attributes: {
            description: 'description',
            name: 'name',
            'image-url': 'imageUrl',
            category: 'category',
            'is-simplified-access': true,
            level: 3,
          },
          relationships: {
            badges: {
              data: [
                {
                  id: '1',
                  type: 'badges',
                },
              ],
            },
            frameworks: {
              data: [{ id: 'framework1', type: 'frameworks' }],
            },
          },
        },
        included: [
          {
            attributes: {
              'alt-message': 'altMessage',
              'image-url': '/img/banana',
              'is-always-visible': false,
              'is-certifiable': false,
              key: 'key',
              message: 'message',
              title: 'title',
            },
            id: '1',
            type: 'badges',
          },
          {
            attributes: {
              name: '@tubeName',
              'practical-title': 'titre pratique',
              'practical-description': 'description pratique',
              'is-mobile-compliant': false,
              'is-tablet-compliant': false,
              'max-level': 2,
            },
            id: 'tube1.1',
            type: 'tubes',
          },
          {
            attributes: {
              name: 'Ma thématique 1',
              index: 0,
            },
            id: 'thematic1',
            type: 'thematics',
            relationships: {
              tubes: {
                data: [{ id: 'tube1.1', type: 'tubes' }],
              },
            },
          },
          {
            attributes: {
              index: '1.1',
              name: 'Manger des fruits',
            },
            id: 'comp1',
            type: 'competences',
            relationships: {
              thematics: {
                data: [
                  {
                    id: 'thematic1',
                    type: 'thematics',
                  },
                ],
              },
            },
          },
          {
            attributes: {
              name: '@tubeName',
              'practical-title': 'titre pratique',
              'practical-description': 'description pratique',
              'is-mobile-compliant': false,
              'is-tablet-compliant': false,
              'max-level': 4,
            },
            id: 'tube2.1',
            type: 'tubes',
          },
          {
            attributes: {
              name: 'Ma thématique 2',
              index: 0,
            },
            id: 'thematic2',
            type: 'thematics',
            relationships: {
              tubes: {
                data: [{ id: 'tube2.1', type: 'tubes' }],
              },
            },
          },
          {
            attributes: {
              index: '1.1',
              name: 'Manger des fruits',
            },
            id: 'comp2',
            type: 'competences',
            relationships: {
              thematics: {
                data: [
                  {
                    id: 'thematic2',
                    type: 'thematics',
                  },
                ],
              },
            },
          },
          {
            attributes: {
              code: '5',
              color: 'red',
              title: 'Super domaine',
            },
            id: 'area1',
            relationships: {
              competences: {
                data: [
                  {
                    id: 'comp1',
                    type: 'competences',
                  },
                  {
                    id: 'comp2',
                    type: 'competences',
                  },
                ],
              },
            },
            type: 'areas',
          },
          {
            attributes: {
              name: 'pix',
            },
            id: 'framework1',
            relationships: {
              areas: {
                data: [
                  {
                    id: 'area1',
                    type: 'areas',
                  },
                ],
              },
            },
            type: 'frameworks',
          },
        ],
      });
    });
  });
});
