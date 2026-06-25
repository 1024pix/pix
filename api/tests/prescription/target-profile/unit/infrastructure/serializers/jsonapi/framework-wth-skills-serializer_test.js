import { frameworkWithSkillsSerializer } from '../../../../../../../src/prescription/target-profile/infrastructure/serializers/jsonapi/framework-with-skills-serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | framework', function () {
  describe('#serialize', function () {
    it('should serialize target profile to JSONAPI', function () {
      // given
      const frameworks = [
        {
          id: 'frameworkPix',
          name: 'Pix',
          areas: [
            {
              id: 'areaPix1',
              code: '1',
              title: 'areaPix1 title fr',
              color: 'areaPix1 color',
              competenceIds: ['competencePix1_1'],
              frameworkId: 'frameworkPix',
              competences: [
                {
                  id: 'competencePix1_1',
                  name: 'competencePix1_1 name fr',
                  areaId: 'areaPix1',
                  index: '0',
                  origin: 'Pix',
                  thematicIds: ['thematicPix1_1_1'],
                  thematics: [
                    {
                      id: 'thematicPix1_1_1',
                      name: 'thematicPix1_1_1 name fr',
                      index: 0,
                      tubeIds: ['tubePix1_1_1_1'],
                      competenceId: 'competencePix1_1',
                      tubes: [
                        {
                          id: 'tubePix1_1_1_1',
                          name: '@tubePix1_1_1_1',
                          practicalTitle: 'tubePix1_1_1_1 practicalTitle fr',
                          practicalDescription: 'tubePix1_1_1_1 practicalDescription fr',
                          competenceId: 'competencePix1_1',
                          isMobileCompliant: true,
                          isTabletCompliant: true,
                          skillIds: ['skillPix1_1_1_1_1'],
                          thematicId: 'thematicPix1_1_1',
                          skills: [
                            {
                              id: 'skillPix1_1_1_1_1',
                              status: 'actif',
                              tubeId: 'tubePix1_1_1_1',
                              difficulty: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'frameworkFrance',
          name: 'France',
          areas: [
            {
              id: 'areaFrance1',
              code: '1',
              title: 'areaFrance1 title fr',
              color: 'areaFrance1 color',
              competenceIds: ['competenceFrance1_1'],
              frameworkId: 'frameworkFrance',
              competences: [
                {
                  id: 'competenceFrance1_1',
                  name: 'competenceFrance1_1 name fr',
                  areaId: 'areaFrance1',
                  index: '0',
                  origin: 'France',
                  thematicIds: ['thematicFrance1_1_1'],
                  thematics: [
                    {
                      id: 'thematicFrance1_1_1',
                      name: 'thematicFrance1_1_1 name fr',
                      index: 0,
                      tubeIds: ['tubeFrance1_1_1_1'],
                      competenceId: 'competenceFrance1_1',
                      tubes: [
                        {
                          id: 'tubeFrance1_1_1_1',
                          name: '@tubeFrance1_1_1_1',
                          practicalTitle: 'tubeFrance1_1_1_1 practicalTitle fr',
                          practicalDescription: 'tubeFrance1_1_1_1 practicalDescription fr',
                          competenceId: 'competenceFrance1_1',
                          isMobileCompliant: true,
                          isTabletCompliant: false,
                          skillIds: ['skillFrance1_1_1_1_1'],
                          thematicId: 'thematicFrance1_1_1',
                          skills: [
                            {
                              id: 'skillFrance1_1_1_1_1',
                              status: 'actif',
                              tubeId: 'tubeFrance1_1_1_1',
                              difficulty: 1,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const expectedResult = {
        data: [
          {
            type: 'frameworks',
            id: 'frameworkPix',
            attributes: {
              name: 'Pix',
            },
            relationships: {
              areas: {
                data: [
                  {
                    type: 'areas',
                    id: 'areaPix1',
                  },
                ],
              },
            },
          },
          {
            type: 'frameworks',
            id: 'frameworkFrance',
            attributes: {
              name: 'France',
            },
            relationships: {
              areas: {
                data: [
                  {
                    type: 'areas',
                    id: 'areaFrance1',
                  },
                ],
              },
            },
          },
        ],
        included: [
          {
            type: 'skills',
            id: 'skillPix1_1_1_1_1',
            attributes: {
              difficulty: 1,
            },
          },
          {
            type: 'tubes',
            id: 'tubePix1_1_1_1',
            attributes: {
              name: '@tubePix1_1_1_1',
              'practical-title': 'tubePix1_1_1_1 practicalTitle fr',
              'practical-description': 'tubePix1_1_1_1 practicalDescription fr',
              'is-mobile-compliant': true,
              'is-tablet-compliant': true,
            },
            relationships: {
              skills: {
                data: [
                  {
                    type: 'skills',
                    id: 'skillPix1_1_1_1_1',
                  },
                ],
              },
            },
          },
          {
            type: 'thematics',
            id: 'thematicPix1_1_1',
            attributes: {
              name: 'thematicPix1_1_1 name fr',
              index: 0,
            },
            relationships: {
              tubes: {
                data: [
                  {
                    type: 'tubes',
                    id: 'tubePix1_1_1_1',
                  },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'competencePix1_1',
            attributes: {
              name: 'competencePix1_1 name fr',
              index: '0',
            },
            relationships: {
              thematics: {
                data: [
                  {
                    type: 'thematics',
                    id: 'thematicPix1_1_1',
                  },
                ],
              },
            },
          },
          {
            type: 'areas',
            id: 'areaPix1',
            attributes: {
              code: '1',
              title: 'areaPix1 title fr',
              color: 'areaPix1 color',
            },
            relationships: {
              competences: {
                data: [
                  {
                    type: 'competences',
                    id: 'competencePix1_1',
                  },
                ],
              },
            },
          },
          {
            type: 'skills',
            id: 'skillFrance1_1_1_1_1',
            attributes: {
              difficulty: 1,
            },
          },
          {
            type: 'tubes',
            id: 'tubeFrance1_1_1_1',
            attributes: {
              name: '@tubeFrance1_1_1_1',
              'practical-title': 'tubeFrance1_1_1_1 practicalTitle fr',
              'practical-description': 'tubeFrance1_1_1_1 practicalDescription fr',
              'is-mobile-compliant': true,
              'is-tablet-compliant': false,
            },
            relationships: {
              skills: {
                data: [
                  {
                    type: 'skills',
                    id: 'skillFrance1_1_1_1_1',
                  },
                ],
              },
            },
          },
          {
            type: 'thematics',
            id: 'thematicFrance1_1_1',
            attributes: {
              name: 'thematicFrance1_1_1 name fr',
              index: 0,
            },
            relationships: {
              tubes: {
                data: [
                  {
                    type: 'tubes',
                    id: 'tubeFrance1_1_1_1',
                  },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'competenceFrance1_1',
            attributes: {
              name: 'competenceFrance1_1 name fr',
              index: '0',
            },
            relationships: {
              thematics: {
                data: [
                  {
                    type: 'thematics',
                    id: 'thematicFrance1_1_1',
                  },
                ],
              },
            },
          },
          {
            type: 'areas',
            id: 'areaFrance1',
            attributes: {
              code: '1',
              title: 'areaFrance1 title fr',
              color: 'areaFrance1 color',
            },
            relationships: {
              competences: {
                data: [
                  {
                    type: 'competences',
                    id: 'competenceFrance1_1',
                  },
                ],
              },
            },
          },
        ],
      };

      // when
      const serializedFramework = frameworkWithSkillsSerializer.serialize(frameworks);

      // then
      return expect(serializedFramework).to.deep.equal(expectedResult);
    });
  });
});
