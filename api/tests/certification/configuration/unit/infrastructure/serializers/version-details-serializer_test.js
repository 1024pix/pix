import { expect } from 'chai';

import * as serializer from '../../../../../../src/certification/configuration/infrastructure/serializers/version-details-serializer.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Serializer | version-details-serializer', function () {
  describe('#serialize', function () {
    it('should serialize a version with areas to JSONAPI format', function () {
      // given
      const version = domainBuilder.certification.configuration.buildVersionDetails({
        id: 42,
        startDate: new Date('2024-01-01T00:00:00Z'),
        expirationDate: new Date('2025-12-31T00:00:00Z'),
        assessmentDuration: 105,
        minimumAnswersRequiredForValidation: 20,
        maximumAssessmentLength: 32,
        comments: 'some good comments',
        areas: [
          {
            id: 'areaA',
            frameworkId: 'frameworkA',
            code: 'code Domaine A',
            title: 'title FR Domaine A',
            color: 'color Domaine A',
            competences: [
              {
                id: 'competenceA',
                areaId: 'areaA',
                name: 'name FR Competence A',
                index: 'index Competence A',
                thematics: [
                  {
                    id: 'thematicA',
                    competenceId: 'competenceA',
                    name: 'name FR Thematic A',
                    index: 1,
                    tubes: [
                      {
                        id: 'tubeA',
                        thematicId: 'thematicA',
                        competenceId: 'competenceA',
                        name: 'Titre pratique Tube A',
                        practicalTitle: 'practicalTitle FR Tube A',
                        mobile: true,
                        tablet: false,
                        skills: [
                          {
                            id: 'skillA',
                            tubeId: 'tubeA',
                            difficulty: 2,
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
            id: 'areaB',
            frameworkId: 'frameworkB',
            code: 'code Domaine B',
            title: 'title FR Domaine B',
            color: 'color Domaine B',
            competences: [
              {
                id: 'competenceB',
                areaId: 'areaB',
                name: 'name FR Competence B',
                index: 'index Competence B',
                thematics: [
                  {
                    id: 'thematicB',
                    competenceId: 'competenceB',
                    name: 'name FR Thematic B',
                    index: 2,
                    tubes: [
                      {
                        id: 'tubeB',
                        thematicId: 'thematicB',
                        competenceId: 'competenceB',
                        name: 'Titre pratique Tube B',
                        practicalTitle: 'practicalTitle FR Tube B',
                        mobile: false,
                        tablet: true,
                        skills: [
                          {
                            id: 'skillB',
                            tubeId: 'tubeB',
                            difficulty: 6,
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
      });

      // when
      const result = serializer.serialize(version);

      // then
      expect(result).to.deep.equal({
        data: {
          type: 'certification-versions',
          id: '42',
          attributes: {
            'assessment-duration': 105,
            comments: 'some good comments',
            'expiration-date': new Date('2025-12-31T00:00:00Z'),
            'maximum-assessment-length': 32,
            'minimum-answers-required-for-validation': 20,
            'start-date': new Date('2024-01-01T00:00:00Z'),
          },
          relationships: {
            areas: {
              data: [
                {
                  type: 'areas',
                  id: 'areaA',
                },
                {
                  type: 'areas',
                  id: 'areaB',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'skills',
            id: 'skillA',
            attributes: {
              difficulty: 2,
            },
          },
          {
            type: 'tubes',
            id: 'tubeA',
            attributes: {
              mobile: true,
              name: 'Titre pratique Tube A',
              'practical-title': 'practicalTitle FR Tube A',
              tablet: false,
            },
            relationships: {
              skills: {
                data: [
                  {
                    type: 'skills',
                    id: 'skillA',
                  },
                ],
              },
            },
          },
          {
            type: 'thematics',
            id: 'thematicA',
            attributes: {
              index: 1,
              name: 'name FR Thematic A',
            },
            relationships: {
              tubes: {
                data: [
                  {
                    type: 'tubes',
                    id: 'tubeA',
                  },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'competenceA',
            attributes: {
              index: 'index Competence A',
              name: 'name FR Competence A',
            },
            relationships: {
              thematics: {
                data: [
                  {
                    type: 'thematics',
                    id: 'thematicA',
                  },
                ],
              },
            },
          },
          {
            type: 'areas',
            id: 'areaA',
            attributes: {
              code: 'code Domaine A',
              color: 'color Domaine A',
              'framework-id': 'frameworkA',
              title: 'title FR Domaine A',
            },
            relationships: {
              competences: {
                data: [
                  {
                    type: 'competences',
                    id: 'competenceA',
                  },
                ],
              },
            },
          },
          {
            type: 'skills',
            id: 'skillB',
            attributes: {
              difficulty: 6,
            },
          },
          {
            type: 'tubes',
            id: 'tubeB',
            attributes: {
              mobile: false,
              name: 'Titre pratique Tube B',
              'practical-title': 'practicalTitle FR Tube B',
              tablet: true,
            },
            relationships: {
              skills: {
                data: [
                  {
                    type: 'skills',
                    id: 'skillB',
                  },
                ],
              },
            },
          },
          {
            type: 'thematics',
            id: 'thematicB',
            attributes: {
              index: 2,
              name: 'name FR Thematic B',
            },
            relationships: {
              tubes: {
                data: [
                  {
                    type: 'tubes',
                    id: 'tubeB',
                  },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'competenceB',
            attributes: {
              index: 'index Competence B',
              name: 'name FR Competence B',
            },
            relationships: {
              thematics: {
                data: [
                  {
                    type: 'thematics',
                    id: 'thematicB',
                  },
                ],
              },
            },
          },
          {
            type: 'areas',
            id: 'areaB',
            attributes: {
              code: 'code Domaine B',
              color: 'color Domaine B',
              'framework-id': 'frameworkB',
              title: 'title FR Domaine B',
            },
            relationships: {
              competences: {
                data: [
                  {
                    type: 'competences',
                    id: 'competenceB',
                  },
                ],
              },
            },
          },
        ],
      });
    });
  });
});
