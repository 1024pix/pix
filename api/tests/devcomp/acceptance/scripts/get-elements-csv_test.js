import nock from 'nock';
import sinon from 'sinon';

import { ModuleFactory } from '../../../../src/devcomp/infrastructure/factories/module-factory.js';
import { getElements, getElementsListAsCsv } from '../../../../src/devcomp/scripts/get-elements-csv.js';
import { expect } from '../../../test-helper.js';
import moduleContent from './test-module.json' with { type: 'json' };

describe('Acceptance | Script | Get Elements as CSV', function () {
  let modulesListAsJs;

  beforeEach(async function () {
    nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
    modulesListAsJs = [await ModuleFactory.build(moduleContent)];
  });

  describe('#getElements', function () {
    it('should add some meta info to elements', async function () {
      // When
      const elementsListAsJs = await getElements(modulesListAsJs);

      // Then
      expect(elementsListAsJs).to.be.an('array');
      expect(elementsListAsJs.every((element) => element.moduleId !== undefined)).to.be.true;
      expect(elementsListAsJs.every((element) => element.sectionId !== undefined)).to.be.true;
      expect(elementsListAsJs.every((element) => element.elementPosition !== undefined)).to.be.true;
      expect(elementsListAsJs.every((element) => element.sectionPosition !== undefined)).to.be.true;
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
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          description: '<p>Découvrez avec ce didacticiel comment fonctionne Modulix !</p>',
          duration: 5,
          level: 'novice',
          tabletSupport: 'inconvenient',
          objectives: ['Naviguer dans Modulix', 'Découvrir les leçons et les activités'],
        },
        sections: [
          {
            id: '5bf1c672-3746-4480-b9ac-1f0af9c7c509',
            type: 'practise',
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
        .equal(`\ufeff"ElementModule"\t"ElementSectionId"\t"ElementGrainId"\t"ElementId"\t"ElementType"\t"ElementGrainTitle"\t"ElementSectionPosition"\t"ElementGrainPosition"\t"ActivityElementPosition"\t"ElementInstruction"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"d6ed29e2-fb0b-4f03-9e26-61029ecde2e3"\t"08a8b1ea-4771-48ef-a5a5-665c664ba673"\t"text"\t""\t1\t1\t1\t
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"\t"47823e8f-a4af-44d6-96f7-5b6fc7bc6b51"\t"flashcards"\t"Voici une leçon"\t1\t2\t2\t"<p>Lisez la question, essayez de trouver la réponse puis retourner la carte en cliquant dessus.<br>Cela permet de tester votre mémoire 🎯</p>"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"\t"e9aef60c-f18a-471e-85c7-e50b4731b86b"\t"text"\t"Voici une leçon"\t1\t2\t3\t
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"\t"048e5319-5e81-44cc-ad71-c6c0d3be611f"\t"separator"\t"Voici une leçon"\t1\t2\t4\t
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"\t"8d7687c8-4a02-4d7e-bf6c-693a6d481c78"\t"image"\t"Voici une leçon"\t1\t2\t5\t
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"\t"84726001-1665-457d-8f13-4a74dc4768ea"\t"expand"\t"Voici une leçon"\t1\t2\t6\t
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"b14df125-82d5-4d55-a660-7b34cd9ea1ab"\t"901ccbaa-f4e6-4322-b863-8e8eab08a33a"\t"download"\t"Un fichier à télécharger"\t1\t3\t7\t
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"b14df125-82d5-4d55-a660-7b34cd9ea1ab"\t"31106aeb-8346-44a6-8ed4-ebaa2106a373"\t"qcu"\t"Un fichier à télécharger"\t1\t3\t8\t"<p>Quelle type de recette souhaite obtenir l'utilisateur dans l'image&nbsp;?</p>"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"73ac3644-7637-4cee-86d4-1a75f53f0b9c"\t"3a9f2269-99ba-4631-b6fd-6802c88d5c26"\t"video"\t"Vidéo de présentation de Pix"\t1\t4\t9\t
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"73ac3644-7637-4cee-86d4-1a75f53f0b9c"\t"5eb98d91-6b15-4a3d-ad24-14d442d03330"\t"short-video"\t"Vidéo de présentation de Pix"\t1\t4\t10\t
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"533c69b8-a836-41be-8ffc-8d4636e31224"\t"71de6394-ff88-4de3-8834-a40057a50ff4"\t"qcu"\t"Voici un vrai-faux"\t1\t5\t11\t"<p>Pix évalue 16 compétences numériques différentes.</p>"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"533c69b8-a836-41be-8ffc-8d4636e31224"\t"79dc17f9-142b-4e19-bcbe-bfde4e170d3f"\t"qcu"\t"Voici un vrai-faux"\t1\t5\t12\t"<p>Pix est découpé en 6 domaines.</p>"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"533c69b8-a836-41be-8ffc-8d4636e31224"\t"09dc17f9-142b-4e19-bcbe-bfde4e170d3l"\t"qcu-declarative"\t"Voici un vrai-faux"\t1\t5\t13\t"<p>Pix est découpé en 6 domaines.</p>"
"6282925d-4775-4bca-b513-4c3009ec5886"	"5bf1c672-3746-4480-b9ac-1f0af9c7c509"	"533c69b8-a836-41be-8ffc-8d4636e31224"	"6328a322-259c-4641-b708-1b603b8d5952"	"qcm-declarative"	"Voici un vrai-faux"\t1\t5\t14\t"<p>Quelles sont tes séries favorites ?</p>"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"0be0f5eb-4cb6-47c2-b9d3-cb2ceb4cd21c"\t"30701e93-1b4d-4da4-b018-fa756c07d53f"\t"qcm"\t"Les 3 piliers de Pix"\t1\t6\t15\t"<p>Quels sont les 3 piliers de Pix&#8239;?</p>"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"4ce2a31a-6584-4dae-87c6-d08b58d0f3b9"\t"c23436d4-6261-49f1-b50d-13a547529c29"\t"qrocm"\t"Connaissez-vous bien Pix"\t1\t7\t16\t"<p>Compléter le texte suivant :</p>"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"46577fb1-aadb-49ba-b3fd-721a11da8eb4"\t"0e3315fd-98ad-492f-9046-4aa867495d84"\t"embed"\t"Embed non-auto"\t1\t8\t17\t"<p>Vous participez à la visioconférence ci-dessous.</p>"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"46577fb1-aadb-49ba-b3fd-721a11da8eb5"\t"f00133f5-0653-425b-a25f-3c9604820529"\t"custom-draft"\t"Elément custom"\t1\t9\t18\t"<p>Retournez les cartes.</p>"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"46577fb1-aadb-49ba-b3fd-721a11da8eb5"\t"0e3315fd-98ad-492f-9046-4aa867495d85"\t"custom"\t"Elément custom"\t1\t9\t19\t"Voici un extrait de conversation"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"cf436761-f56d-4b01-83f9-942afe9ce72c"\t"ed795d29-5f04-499c-a9c8-4019125c5cb1"\t"qab"\t"test qab"\t1\t10\t20\t"<p><strong>Maintenant, entraînez-vous sur des exemples concrets !</strong> </p> <p> Pour chaque exemple, choisissez si l’affirmation est <strong>vraie</strong> ou <strong>fausse</strong>.</p>"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"cef7d350-008b-410b-8a6a-39b56efdbe8d"\t"0c397035-a940-441f-8936-050db7f997af"\t"qcu-discovery"\t"test qcu-discovery"\t1\t11\t21\t"<p>Quel est le dessert classique idéal lors d’un goûter&nbsp;?</p>"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"cef7d350-008b-410b-8a6a-39b56efdbe8d"\t"42260c2a-31a9-4d71-86d9-d38ccf408579"\t"audio"\t"test qcu-discovery"\t1\t11\t22\t`);
    });
  });
});
