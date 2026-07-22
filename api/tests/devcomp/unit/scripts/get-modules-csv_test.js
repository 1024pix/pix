import { _getTotalElementsCount } from '../../../../src/devcomp/scripts/get-modules-csv.js';
import { expect } from '../../../test-helper.js';
import { catchErrSync } from '../../../tooling/test-utils/error.js';

describe('Unit | Scripts | Get Modules as CSV', function () {
  describe('#getTotalElements', function () {
    it('should count elements inside component "element"', function () {
      // given
      const grains = [
        {
          components: [
            {
              type: 'element',
              element: {
                id: '84726001-1665-457d-8f13-4a74dc4768ea',
                type: 'text',
                content:
                  '<h4>On commence avec les leçons.<br>Les leçons sont des textes, des images ou des vidéos. Les leçons sont là pour vous expliquer des concepts ou des méthodes.</h4>',
              },
            },
            {
              type: 'element',
              element: {
                id: 'a2372bf4-86a4-4ecc-a188-b51f4f98bca2',
                type: 'text',
                content:
                  '<p>Voici un texte de leçon. Parfois, il y a des émojis pour aider à la lecture&nbsp;<span aria-hidden="true">📚</span>.<br>Et là, voici une image&#8239;!</p>',
              },
            },
            {
              type: 'element',
              element: {
                id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
                type: 'image',
                url: 'https://assets.pix.org/modules/didacticiel/ordi-spatial.svg',
                alt: "Dessin détaillé dans l'alternative textuelle",
                alternativeText: "Dessin d'un ordinateur dans un univers spatial.",
              },
            },
          ],
        },
      ];

      // when
      const result = _getTotalElementsCount(grains);

      // then
      expect(result).to.equal(3);
    });

    it('should count elements inside stepper', function () {
      // given
      const grains = [
        {
          components: [
            {
              type: 'stepper',
              steps: [
                {
                  elements: [
                    {
                      id: '342183f7-af51-4e4e-ab4c-ebed1e195063',
                      type: 'text',
                      content: '<p>À la fin de cette vidéo, une question sera posée sur les compétences Pix.</p>',
                    },
                  ],
                },
                {
                  elements: [
                    {
                      id: '342183f7-af51-4e4e-ab4c-ebed1e195063',
                      type: 'text',
                      content: '<p>À la fin de cette vidéo, une question sera posée sur les compétences Pix.</p>',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      // when
      const result = _getTotalElementsCount(grains);

      // then
      expect(result).to.equal(2);
    });

    it('should not filter non existing element type', function () {
      // given
      const grains = [
        {
          components: [
            {
              type: 'stepper',
              steps: [
                {
                  elements: [
                    {
                      type: 'non-existing-element-type',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          components: [
            {
              type: 'element',
              element: {
                type: 'non-existing-element-type',
              },
            },
          ],
        },
      ];

      // when
      const result = _getTotalElementsCount(grains);

      // then
      expect(result).to.equal(2);
    });

    it('should throw if component type is not available', function () {
      // given
      const grains = [
        {
          components: [
            {
              type: 'non-existing-component-type',
            },
          ],
        },
      ];

      // when
      const err = catchErrSync(_getTotalElementsCount)(grains);

      // then
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Component type "non-existing-component-type" is not available');
    });
  });
});
