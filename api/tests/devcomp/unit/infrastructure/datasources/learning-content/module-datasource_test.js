import moduleDatasource from '../../../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { expect } from '../../../../../test-helper.js';
import { LearningContentResourceNotFound } from '../../../../../../src/shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';

describe('Unit | Infrastructure | Datasource | Learning Content | ModuleDatasource', function () {
  describe('#getBySlug', function () {
    describe('when exists', function () {
      it('should return a Module instance', async function () {
        // given
        const slug = 'les-adresses-mail';

        // when
        const module = await moduleDatasource.getBySlug(slug);

        // then
        const expectedModuleData = {
          grains: [
            {
              elements: [
                {
                  content:
                    '<p><strong>L’identifiant</strong> est la première partie de l’adresse mail. Il a été choisi par Mickaël.</p><p>Tous les identifiants sont possibles, ou presque. Même avec des majuscules !</p><p>Par exemple : mika671 ou G3oDu671</p><p>Des caractères sont interdits : &, @, $, *, €, £, …</p>',
                  id: 'c1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
                  type: 'text',
                },
              ],
              id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
              title: 'Grain 1',
              type: 'lesson',
            },
            {
              elements: [
                {
                  content:
                    '<p><strong>L’arobase</strong> est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p>En anglais, ce symbole se lit “at” qui veut dire “chez”.</p><p> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>',
                  id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                  type: 'text',
                },
              ],
              id: 'ef206449-bb3a-423a-83d8-2d1e61f95137',
              title: 'Grain 2',
              type: 'lesson',
            },
            {
              elements: [
                {
                  content:
                    '<p><strong>Le fournisseur d’adresse mail</strong> est la deuxième partie de l’adresse mail.</p><p>Cette partie de l’adresse est donnée par le fournisseur.</p><p>Des exemples de fournisseurs d’adresses mail : <ul><li>La Poste (laposte.net)</li><li>Google (gmail.com)</li><li>Yahoo (yahoo.com)</li><li>Microsoft (hotmail.com, live.fr)</li></ul></p><p>L’avez-vous remarqué ? Cette partie est en 2 morceaux : le nom du fournisseur (par exemple “laposte”) et une extension (dans notre exemple, “.net”).</p>',
                  id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                  type: 'text',
                },
              ],
              id: 'b3cc5efe-ed64-4291-bb19-089373450cf6',
              title: 'Grain 3',
              type: 'lesson',
            },
            {
              elements: [
                {
                  feedbacks: {
                    invalid: 'Mince...',
                    valid: 'Bravo !',
                  },
                  id: 'z3b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p7',
                  instruction: '<p>On peut avoir des chiffres dans l’identifiant de son adresse mail</p>',
                  proposals: [
                    {
                      content: 'vrai',
                      id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                      isValid: true,
                    },
                    {
                      content: 'faux',
                      id: 'b5a4c3d2-e1f6-7g8h-9i0j-k1l2m3n4o5p6',
                      isValid: false,
                    },
                  ],
                  solution: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                  type: 'qcu',
                },
              ],
              id: '71792e45-966a-4070-b4fc-9e8a773c3f6f',
              title: 'Grain 4',
              type: 'activity',
            },
          ],
          id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
          slug: 'les-adresses-mail',
          title: 'Les adresses mail',
        };
        expect(module).to.deep.equal(expectedModuleData);
      });
    });

    describe("when doesn't exist", function () {
      it('should throw an LearningContentResourceNotFound', async function () {
        // given
        const slug = 'dresser-un-pokemon';

        // when & then
        await expect(moduleDatasource.getBySlug(slug)).to.have.been.rejectedWith(LearningContentResourceNotFound);
      });
    });
  });
});
