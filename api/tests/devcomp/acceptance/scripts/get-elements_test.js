import { getElements, getElementsListAsCsv } from '../../../../scripts/modulix/get-elements-csv.js';
import moduleDatasource from '../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { getBySlug } from '../../../../src/devcomp/infrastructure/repositories/module-repository.js';
import { expect } from '../../../test-helper.js';

describe('Acceptance | Script | Get Elements as CSV', function () {
  let modulesListAsJs;

  beforeEach(async function () {
    modulesListAsJs = [await getBySlug({ slug: 'didacticiel-modulix', moduleDatasource })];
  });

  describe('#getElements', function () {
    it('should filter out elements that are not activities', async function () {
      // When
      const elementsListAsJs = await getElements(modulesListAsJs);

      // Then
      expect(elementsListAsJs).to.be.an('array');
      expect(
        elementsListAsJs.every((element) =>
          ['download', 'embed', 'image', 'qcm', 'qcu', 'qrocm', 'separator', 'text', 'video'].includes(element.type),
        ),
      ).to.be.true;
    });

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
  });

  describe('#getElementsListAsCsv', function () {
    it(`should return elements list as CSV`, async function () {
      // When
      const elementsListAsCsv = await getElementsListAsCsv(modulesListAsJs);

      // Then
      expect(elementsListAsCsv).to.be.a('string');
      expect(elementsListAsCsv).to
        .equal(`\ufeff"ElementId"	"ElementType"	"ElementPosition"	"ElementGrainPosition"	"ElementGrainId"	"ElementGrainTitle"	"ElementModuleSlug"
"84726001-1665-457d-8f13-4a74dc4768ea"	"text"	1	1	"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"	"Voici une leçon"	"didacticiel-modulix"
"048e5319-5e81-44cc-ad71-c6c0d3be611f"	"separator"	2	1	"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"	"Voici une leçon"	"didacticiel-modulix"
"a2372bf4-86a4-4ecc-a188-b51f4f98bca2"	"text"	3	1	"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"	"Voici une leçon"	"didacticiel-modulix"
"4cfd27d5-0947-47af-bfb6-52467143c38b"	"text"	4	1	"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"	"Voici une leçon"	"didacticiel-modulix"
"8d7687c8-4a02-4d7e-bf6c-693a6d481c78"	"image"	5	1	"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"	"Voici une leçon"	"didacticiel-modulix"
"901ccbaa-f4e6-4322-b863-8e8eab08a33a"	"download"	6	2	"b14df125-82d5-4d55-a660-7b34cd9ea1ab"	"Un fichier à télécharger"	"didacticiel-modulix"
"31106aeb-8346-44a6-8ed4-ebaa2106a373"	"qcu"	7	2	"b14df125-82d5-4d55-a660-7b34cd9ea1ab"	"Un fichier à télécharger"	"didacticiel-modulix"
"342183f7-af51-4e4e-ab4c-ebed1e195063"	"text"	8	3	"73ac3644-7637-4cee-86d4-1a75f53f0b9c"	"Vidéo de présentation de Pix"	"didacticiel-modulix"
"3a9f2269-99ba-4631-b6fd-6802c88d5c26"	"video"	9	3	"73ac3644-7637-4cee-86d4-1a75f53f0b9c"	"Vidéo de présentation de Pix"	"didacticiel-modulix"
"71de6394-ff88-4de3-8834-a40057a50ff4"	"qcu"	10	4	"533c69b8-a836-41be-8ffc-8d4636e31224"	"Voici un vrai-faux"	"didacticiel-modulix"
"79dc17f9-142b-4e19-bcbe-bfde4e170d3f"	"qcu"	11	4	"533c69b8-a836-41be-8ffc-8d4636e31224"	"Voici un vrai-faux"	"didacticiel-modulix"
"9c73500d-abd9-4cc4-ab2d-a3876285b13c"	"qcu"	12	4	"533c69b8-a836-41be-8ffc-8d4636e31224"	"Voici un vrai-faux"	"didacticiel-modulix"
"30701e93-1b4d-4da4-b018-fa756c07d53f"	"qcm"	13	5	"0be0f5eb-4cb6-47c2-b9d3-cb2ceb4cd21c"	"Les 3 piliers de Pix"	"didacticiel-modulix"
"0a5e77e8-1c8e-4cb6-a41d-cf6ad7935447"	"qcu"	14	6	"2a77a10f-19a3-4544-80f9-8012dad6506a"	"Activité remonter dans la page"	"didacticiel-modulix"
"c23436d4-6261-49f1-b50d-13a547529c29"	"qrocm"	15	7	"4ce2a31a-6584-4dae-87c6-d08b58d0f3b9"	"Connaissez-vous bien Pix"	"didacticiel-modulix"
"0e3315fd-98ad-492f-9046-4aa867495d84"	"embed"	16	8	"46577fb1-aadb-49ba-b3fd-721a11da8eb4"	"Embed non-auto"	"didacticiel-modulix"
"7fe0bc5f-1988-4da6-8231-a987335f2ae5"	"qrocm"	17	8	"46577fb1-aadb-49ba-b3fd-721a11da8eb4"	"Embed non-auto"	"didacticiel-modulix"
"0559b68c-68a5-4816-a06e-f1c743c391e3"	"embed"	18	9	"e8db3f90-4259-4d54-9113-1c56da726d8d"	"Embed auto"	"didacticiel-modulix"
"98c51fa7-03b7-49b1-8c5e-49341d35909c"	"qrocm"	19	10	"7cf75e70-8749-4392-8081-f2c02badb0fb"	"Le nom de ce produit"	"didacticiel-modulix"`);
    });
  });
});
