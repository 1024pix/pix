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
                    "<h3 class='sr-only'>L'identifiant</h3><h4><span aria-hidden='true'>1️⃣</span><span class='sr-only'>1</span> L’identifiant est la première partie de l’adresse mail. Il a été choisi par Mickaël.</h4><p>Tous les identifiants sont possibles, ou presque. Même avec des majuscules !</p><p><span aria-hidden='true'>✅</span> Par exemple : mika671 ou G3oDu671</p><p><span aria-hidden='true'>❌</span> Des caractères sont interdits :</p><ul><li>&amp;</li><li>@</li><li>$</li><li>*</li><li>€</li><li>£</li><li>…</li></ul>",
                  id: 'c1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
                  type: 'text',
                },
                {
                  content:
                    "<h3 class='sr-only'>L'arobase</h3><p>L’arobase est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p><p><span aria-hidden='true'>🇬🇧</span> En anglais, ce symbole se lit <i lang='en'>“at”</i> qui veut dire “chez”.</p><p><span aria-hidden='true'>🤔</span> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>",
                  id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
                  type: 'text',
                },
                {
                  content:
                    "<h3 class='sr-only'>Le fournisseur d’adresse mail</h3><h4><span aria-hidden='true'>2️⃣</span><span class='sr-only'>2</span> Le fournisseur d’adresse mail est la deuxième partie de l’adresse mail.</h4><p>Cette partie de l’adresse est donnée par le fournisseur.</p><p><span aria-hidden='true'>✅</span> Des exemples de fournisseurs d’adresses mail : </p><ul><li>La Poste (laposte.net)</li><li>Google (gmail.com)</li><li>Yahoo (yahoo.com)</li><li>Microsoft (hotmail.com, live.fr)</li></ul><p><span aria-hidden='true'>🧐</span> L’avez-vous remarqué ? Cette partie est en 2 morceaux : le nom du fournisseur (par exemple “laposte”) et une extension (dans notre exemple, “.net”).</p>",
                  id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                  type: 'text',
                },
              ],
              id: 'z1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
              title: 'Explications : les parties d’une adresse mail',
              type: 'lesson',
            },
            {
              elements: [
                {
                  feedbacks: {
                    invalid:
                      '<p>Et si ! les chiffres sont autorisés dans l’identifiant d’une adresse mail. Seuls certains caractères sont interdits, comme</p><ul><li>é</li><li>â</li><li>&</li><li>@</li><li>$</li><li>*</li><li>€</li><li>£</li><li>etc…</li></ul>',
                    valid:
                      '<p>Oui, aucun problème ! Seuls certains caractères sont interdits, comme</p><ul><li>é</li><li>â</li><li>&</li><li>@</li><li>$</li><li>*</li><li>€</li><li>£</li><li>etc…</li></ul>',
                  },
                  id: 'z3b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p7',
                  instruction: '<p>On peut avoir des chiffres dans l’identifiant de son adresse mail</p>',
                  proposals: [
                    {
                      content: 'Vrai',
                      id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    },
                    {
                      content: 'Faux',
                      id: 'b5a4c3d2-e1f6-7g8h-9i0j-k1l2m3n4o5p6',
                    },
                  ],
                  solution: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                  type: 'qcu',
                },
                {
                  feedbacks: {
                    invalid:
                      '<p>On peut avoir des chiffres n’importe où dans l’identifiant. On peut aussi utiliser des majuscules.</p>',
                    valid:
                      '<p>On peut avoir des chiffres n’importe où dans l’identifiant. On peut aussi utiliser des majuscules.</p>',
                  },
                  id: 'ba78dead-a806-4954-b408-e8ef28d28fab',
                  instruction: '<p>L’adresse mail M3g4Cool1415@gmail.com est correctement écrite ?</p>',
                  proposals: [
                    {
                      content: 'Vrai',
                      id: '6d4db7f8-b783-473d-a1cc-73dac8411855',
                    },
                    {
                      content: 'Faux',
                      id: '26d27fa3-3269-4d78-916c-3aa066976592',
                    },
                  ],
                  solution: '6d4db7f8-b783-473d-a1cc-73dac8411855',
                  type: 'qcu',
                },
                {
                  feedbacks: {
                    invalid:
                      '<p>Il faut pouvoir séparer l’identifiant et le fournisseur d’adresse. Il y a donc un seul symbole @.</p>',
                    valid:
                      '<p>Il faut pouvoir séparer l’identifiant et le fournisseur d’adresse. Il y a donc un seul symbole @.</p>',
                  },
                  id: '4231af7b-dca5-4d79-acfe-b485e0127ae1',
                  instruction: '<p>Il faut toujours un symbole @ dans une adresse mail ?</p>',
                  proposals: [
                    {
                      content: 'Vrai',
                      id: 'beba4b60-cd4c-49d7-ae1f-2783c14f7c71',
                    },
                    {
                      content: 'Faux',
                      id: 'd784b9f6-5d5a-47ba-ae17-da15b712ab24',
                    },
                  ],
                  solution: 'beba4b60-cd4c-49d7-ae1f-2783c14f7c71',
                  type: 'qcu',
                },
                {
                  feedbacks: {
                    invalid:
                      '<p>Il y a d’autres fournisseurs d’adresses mail que Google (gmail.com).</p><ul>Il y en a énormément, vous avez peut-être déjà vu des adresses</p><ul><li>de chez Microsoft (hotmail.com)</li><li>de chez Free (free.fr)</li><li>ou de chez La Poste (laposte.net).</li></ul>',
                    valid:
                      '<p>Bien vu ! Google n’est effectivement pas le seul fournisseur d’adresse mail. Il y en énormément, vous avez peut-être déjà vu des adresses</p><ul><li>de chez Microsoft (hotmail.com)</li><li>Free (free.fr)</li><li>et La Poste (laposte.net).</li><ul>',
                  },
                  id: '9bd65c37-ea5d-49a9-a59c-4e07ab3f1049',
                  instruction: '<p>Toutes les adresses mails se terminent par gmail.com ?</p>',
                  proposals: [
                    {
                      content: 'Vrai',
                      id: '7ebabab5-6acd-4660-bf33-5cc7206e7288',
                    },
                    {
                      content: 'Faux',
                      id: 'f56bb715-714e-4a94-ba34-eef5ccd755d0',
                    },
                  ],
                  solution: 'f56bb715-714e-4a94-ba34-eef5ccd755d0',
                  type: 'qcu',
                },
              ],
              id: '71792e45-966a-4070-b4fc-9e8a773c3f6f',
              title: 'Diversité des identifiants et des fournisseurs d’adresse mail',
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
