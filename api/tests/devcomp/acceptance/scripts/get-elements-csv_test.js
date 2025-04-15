import sinon from 'sinon';

import { getElements, getElementsListAsCsv } from '../../../../scripts/modulix/get-elements-csv.js';
import { expect } from '../../../test-helper.js';
import moduleContent from './test-module.json' with { type: 'json' };

describe('Acceptance | Script | Get Elements as CSV', function () {
  let modulesListAsJs;

  beforeEach(async function () {
    modulesListAsJs = [moduleContent];
  });

  describe('#getElements', function () {
    it('should add some meta info to elements', async function () {
      // When
      const elementsListAsJs = await getElements(modulesListAsJs);

      // Then
      expect(elementsListAsJs).to.be.an('array');
      expect(elementsListAsJs.every((element) => element.moduleSlug !== undefined)).to.be.true;
      expect(elementsListAsJs.every((element) => element.elementPosition !== undefined)).to.be.true;
      expect(elementsListAsJs.every((element) => element.grainPosition !== undefined)).to.be.true;
      expect(elementsListAsJs.every((element) => element.grainId !== undefined)).to.be.true;
      expect(elementsListAsJs.every((element) => element.grainTitle !== undefined)).to.be.true;
    });

    it('should warn when an element has an unknown type', function () {
      // Given
      const logStub = sinon.stub(console, 'warn');
      const elementWithUnknownType = {
        type: 'element',
        element: {
          id: '048e5319-5e81-44cc-ad71-c6c0d3be666g',
          type: 'notatype',
        },
      };
      const moduleWithUnknownType = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        isBeta: true,
        details: {
          image: 'https://images.pix.fr/modulix/placeholder-details.svg',
          description: '<p>Découvrez avec ce didacticiel comment fonctionne Modulix !</p>',
          duration: 5,
          level: 'Débutant',
          tabletSupport: 'inconvenient',
          objectives: ['Naviguer dans Modulix', 'Découvrir les leçons et les activités'],
        },
        transitionTexts: [],
        grains: [
          {
            id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
            type: 'discovery',
            title: 'Voici une leçon',
            components: [
              {
                type: 'element',
                element: {
                  id: '88fd4558-a3d5-41e9-a7f0-896076529e90',
                  type: 'separatnor',
                },
              },
              elementWithUnknownType,
            ],
          },
        ],
      };

      // When
      getElements([moduleWithUnknownType]);

      // Then
      expect(logStub).to.be.have.been.calledWithExactly(
        `Ignored element 048e5319-5e81-44cc-ad71-c6c0d3be666g with unknown type "notatype".`,
      );
    });
  });

  describe('#getElementsListAsCsv', function () {
    it(`should return elements list as CSV`, async function () {
      // When
      const elementsListAsCsv = await getElementsListAsCsv(modulesListAsJs);

      // Then
      expect(elementsListAsCsv).to.be.a('string');
      expect(elementsListAsCsv).to
        .equal(`\ufeff"ElementId"\t"ElementType"\t"ElementPosition"\t"ElementGrainPosition"\t"ElementGrainId"\t"ElementGrainTitle"\t"ElementModuleSlug"\t"ElementModuleId"
"47823e8f-a4af-44d6-96f7-5b6fc7bc6b51"\t"flashcards"\t1\t1\t"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"\t"Voici une leçon"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"
"e9aef60c-f18a-471e-85c7-e50b4731b86b"\t"text"\t2\t1\t"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"\t"Voici une leçon"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"
"048e5319-5e81-44cc-ad71-c6c0d3be611f"\t"separator"\t3\t1\t"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"\t"Voici une leçon"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"
"8d7687c8-4a02-4d7e-bf6c-693a6d481c78"\t"image"\t4\t1\t"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"\t"Voici une leçon"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"
"84726001-1665-457d-8f13-4a74dc4768ea"\t"expand"\t5\t1\t"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"\t"Voici une leçon"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"
"901ccbaa-f4e6-4322-b863-8e8eab08a33a"\t"download"\t6\t2\t"b14df125-82d5-4d55-a660-7b34cd9ea1ab"\t"Un fichier à télécharger"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"
"31106aeb-8346-44a6-8ed4-ebaa2106a373"\t"qcu"\t7\t2\t"b14df125-82d5-4d55-a660-7b34cd9ea1ab"\t"Un fichier à télécharger"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"
"3a9f2269-99ba-4631-b6fd-6802c88d5c26"\t"video"\t8\t3\t"73ac3644-7637-4cee-86d4-1a75f53f0b9c"\t"Vidéo de présentation de Pix"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"
"71de6394-ff88-4de3-8834-a40057a50ff4"\t"qcu"\t9\t4\t"533c69b8-a836-41be-8ffc-8d4636e31224"\t"Voici un vrai-faux"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"
"79dc17f9-142b-4e19-bcbe-bfde4e170d3f"\t"qcu"\t10\t4\t"533c69b8-a836-41be-8ffc-8d4636e31224"\t"Voici un vrai-faux"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"
"30701e93-1b4d-4da4-b018-fa756c07d53f"\t"qcm"\t11\t5\t"0be0f5eb-4cb6-47c2-b9d3-cb2ceb4cd21c"\t"Les 3 piliers de Pix"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"
"c23436d4-6261-49f1-b50d-13a547529c29"\t"qrocm"\t12\t6\t"4ce2a31a-6584-4dae-87c6-d08b58d0f3b9"\t"Connaissez-vous bien Pix"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"
"0e3315fd-98ad-492f-9046-4aa867495d84"\t"embed"\t13\t7\t"46577fb1-aadb-49ba-b3fd-721a11da8eb4"\t"Embed non-auto"\t"bac-a-sable"\t"6282925d-4775-4bca-b513-4c3009ec5886"`);
    });
  });
});
