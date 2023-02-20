import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/framework-areas-serializer';

describe('Unit | Serializer | JSONAPI | pix-framework-serializer', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      // given
      const tube = domainBuilder.buildTube({
        id: 'tubeId',
        isMobileCompliant: true,
        isTabletCompliant: false,
      });

      const thematicWithTube = domainBuilder.buildThematic({
        id: 'recThem1',
        tubeIds: ['tubeId'],
      });

      const thematicWithoutTube = domainBuilder.buildThematic({
        id: 'recThem2',
      });

      const area = domainBuilder.buildArea({});

      const competence = domainBuilder.buildCompetence({ thematicIds: ['recThem1', 'recThem2'] });
      area.competences = [competence];

      const expectedSerializedResult = {
        data: [
          {
            id: 'recArea123',
            type: 'areas',
            attributes: {
              code: 5,
              color: 'red',
              title: 'Super domaine',
            },
            relationships: {
              competences: {
                data: [
                  {
                    id: 'recCOMP1',
                    type: 'competences',
                  },
                ],
              },
            },
          },
        ],
        included: [
          {
            type: 'tubes',
            id: 'tubeId',
            attributes: {
              name: '@tubeName',
              'practical-title': 'titre pratique',
              'practical-description': 'description pratique',
              mobile: true,
              tablet: false,
            },
          },
          {
            type: 'thematics',
            id: 'recThem1',
            attributes: {
              name: 'My Thematic',
              index: 0,
            },
            relationships: {
              tubes: {
                data: [
                  {
                    id: 'tubeId',
                    type: 'tubes',
                  },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'recCOMP1',
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
            attributes: {
              index: '1.1',
              name: 'Manger des fruits',
            },
          },
        ],
      };

      // when
      const result = serializer.serialize({
        tubes: [tube],
        thematics: [thematicWithTube, thematicWithoutTube],
        areas: [area],
      });

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });

    describe('when without thematics is true', function () {
      it('should return a serialized JSON data object without thematics', function () {
        // given
        const withoutThematics = true;
        const tube = domainBuilder.buildTube({
          id: 'tubeId',
        });

        const thematicWithTube = domainBuilder.buildThematic({
          id: 'recThem1',
          tubeIds: ['tubeId'],
        });

        const thematicWithoutTube = domainBuilder.buildThematic({
          id: 'recThem2',
        });

        const area = domainBuilder.buildArea({});

        const competence = domainBuilder.buildCompetence({ thematicIds: ['recThem1', 'recThem2'] });
        area.competences = [competence];

        const expectedSerializedResult = {
          data: [
            {
              id: 'recArea123',
              type: 'areas',
              attributes: {
                code: 5,
                color: 'red',
                title: 'Super domaine',
              },
              relationships: {
                competences: {
                  data: [
                    {
                      id: 'recCOMP1',
                      type: 'competences',
                    },
                  ],
                },
              },
            },
          ],
          included: [
            {
              type: 'competences',
              id: 'recCOMP1',
              attributes: {
                index: '1.1',
                name: 'Manger des fruits',
              },
            },
          ],
        };

        // when
        const result = serializer.serialize(
          {
            tubes: [tube],
            thematics: [thematicWithTube, thematicWithoutTube],
            areas: [area],
          },
          { withoutThematics }
        );

        // then
        expect(result).to.deep.equal(expectedSerializedResult);
      });
    });
  });
});
