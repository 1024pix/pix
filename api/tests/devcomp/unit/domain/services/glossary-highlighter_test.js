import { expect } from 'chai';

import { Module } from '../../../../../src/devcomp/domain/models/module/Module.js';
import { highlightGlossaryWords } from '../../../../../src/devcomp/domain/services/glossary-highlighter.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Devcomp | Domain | Services | glossary-highlighter', function () {
  describe('#highlightGlossaryWords', function () {
    describe('When glossary is empty', function () {
      it('should return unchanged module', function () {
        // given
        const module = {
          sections: [],
          glossary: [],
        };

        // when
        const result = highlightGlossaryWords(module);

        // then
        expect(result).to.deep.equal(module);
      });
    });

    describe('When glossary entries are incomplete', function () {
      describe('When glossary words are empty', function () {
        it('should not highlight anything', function () {
          // given
          const chatDefinition = 'Le meilleur ami des souris';
          const module = {
            glossary: [{ words: [], definition: chatDefinition }],
            sections: [
              {
                id: `11111111-1111-1111-1111-111111111111`,
                type: 'practise',
                grains: [
                  {
                    id: `22222222-2222-2222-2222-222222222222`,
                    type: 'lesson',
                    title: 'Grain de test',
                    components: [
                      {
                        id: `22222222-2222-2222-2222-222222222223`,
                        type: 'element',
                        element: { type: 'text', content: '<p>Chat lu !</p>' },
                      },
                    ],
                  },
                ],
              },
            ],
          };

          // when
          const result = highlightGlossaryWords(module);

          // then
          const firstElement = (moduleData) => moduleData.sections[0].grains[0].components[0].element;
          expect(firstElement(result).content).to.equal('<p>Chat lu !</p>');
        });
      });

      describe('When glossary words is missing', function () {
        it('should not highlight anything', function () {
          // given
          const chatDefinition = 'Le meilleur ami des souris';
          const module = {
            glossary: [{ definition: chatDefinition }],
            sections: [
              {
                id: `11111111-1111-1111-1111-111111111111`,
                type: 'practise',
                grains: [
                  {
                    id: `22222222-2222-2222-2222-222222222222`,
                    type: 'lesson',
                    title: 'Grain de test',
                    components: [
                      {
                        id: `22222222-2222-2222-2222-222222222223`,
                        type: 'element',
                        element: { type: 'text', content: '<p>Chat lu !</p>' },
                      },
                    ],
                  },
                ],
              },
            ],
          };

          // when
          const result = highlightGlossaryWords(module);

          // then
          const firstElement = (moduleData) => moduleData.sections[0].grains[0].components[0].element;
          expect(firstElement(result).content).to.equal('<p>Chat lu !</p>');
        });
      });

      describe('When glossary definition is empty', function () {
        it('should not highlight entry words', function () {
          // given
          const module = {
            glossary: [{ words: ['chat'], definition: '' }],
            sections: [
              {
                id: `11111111-1111-1111-1111-111111111111`,
                type: 'practise',
                grains: [
                  {
                    id: `22222222-2222-2222-2222-222222222222`,
                    type: 'lesson',
                    title: 'Grain de test',
                    components: [
                      {
                        id: `22222222-2222-2222-2222-222222222223`,
                        type: 'element',
                        element: { type: 'text', content: '<p>Chat lu !</p>' },
                      },
                    ],
                  },
                ],
              },
            ],
          };

          // when
          const result = highlightGlossaryWords(module);

          // then
          const firstElement = (moduleData) => moduleData.sections[0].grains[0].components[0].element;
          expect(firstElement(result).content).to.equal('<p>Chat lu !</p>');
        });
      });

      it('should still highlight words of other valid entries', function () {
        // given
        const chienDefinition = 'Le meilleur ami des humains';
        const sourisDefinition = 'Le meilleur ami des cuisines';
        const module = domainBuilder.buildModule({
          glossary: [
            { words: ['chat'], definition: '' },
            { words: [], definition: sourisDefinition },
            { words: ['chien'], definition: chienDefinition },
          ],
          sections: [
            {
              id: `11111111-1111-1111-1111-111111111111`,
              type: 'practise',
              grains: [
                {
                  id: `22222222-2222-2222-2222-222222222222`,
                  type: 'lesson',
                  title: 'Grain de test',
                  components: [
                    {
                      id: `22222222-2222-2222-2222-222222222223`,
                      type: 'element',
                      element: { type: 'text', content: '<p>Le chat, le chien et une souris</p>' },
                    },
                  ],
                },
              ],
            },
          ],
        });

        // when
        const result = highlightGlossaryWords(module);

        // then
        const firstElement = (moduleData) => moduleData.sections[0].grains[0].components[0].element;
        expect(firstElement(result).content).to.equal(
          `<p>Le chat, le <highlighted-button word="chien" definition="${chienDefinition}">chien</highlighted-button> et une souris</p>`,
        );
      });
    });

    describe('When glossary is not empty', function () {
      describe('When module has element component', function () {
        describe('When module has a text element', function () {
          it('should enclose text element content words occurrences with a span tag', function () {
            // given
            const reseauDefinition = 'Des machines reliées';
            const module = domainBuilder.buildModule({
              glossary: [{ words: ['réseau', 'réseaux'], definition: reseauDefinition }],
              sections: [
                {
                  id: `11111111-1111-1111-1111-111111111111`,
                  type: 'practise',
                  grains: [
                    {
                      id: `22222222-2222-2222-2222-222222222222`,
                      type: 'lesson',
                      title: 'Grain de test',
                      components: [
                        {
                          id: `22222222-2222-2222-2222-222222222223`,
                          type: 'element',
                          element: { type: 'text', content: '<p>réseau et réseau</p>' },
                        },
                      ],
                    },
                  ],
                },
              ],
            });

            // when
            const result = highlightGlossaryWords(module);

            // then
            expect(result).to.be.an.instanceOf(Module);
            const firstElement = (moduleData) => moduleData.sections[0].grains[0].components[0].element;
            expect(firstElement(result).content).to.equal(
              `<p><highlighted-button word="réseau" definition="${reseauDefinition}">réseau</highlighted-button> et <highlighted-button word="réseau" definition="${reseauDefinition}">réseau</highlighted-button></p>`,
            );
          });
        });

        describe('When module has an element with an instruction field', function () {
          it('should enclose instruction content occurrences with a span tag', function () {
            // given
            const chienDefinition = 'Le meilleur ami des humains';
            const chatDefinition = 'Le meilleur ami des souris';
            const qcu = {
              id: `22222222-2222-2222-2222-222222222223`,
              type: 'element',
              element: { type: 'qcu', instruction: '<p>Le chat ?</p>', proposals: [{ content: 'chat' }] },
            };
            const qrocm = {
              id: `22222222-2222-2222-2222-222222222224`,
              type: 'element',
              element: { type: 'qrocm', instruction: '<p>Le chien ?</p>', proposals: [{ content: 'chien' }] },
            };

            const module = domainBuilder.buildModule({
              glossary: [
                { words: ['chien'], definition: chienDefinition },
                { words: ['chat'], definition: chatDefinition },
              ],
              sections: [
                {
                  id: `11111111-1111-1111-1111-111111111111`,
                  type: 'practise',
                  grains: [
                    {
                      id: `22222222-2222-2222-2222-222222222222`,
                      type: 'lesson',
                      title: 'Grain de test',
                      components: [qcu, qrocm],
                    },
                  ],
                },
              ],
            });

            // when
            const result = highlightGlossaryWords(module);

            // then
            const qcuElement = result.sections[0].grains[0].components[0].element;
            const qrocmElement = result.sections[0].grains[0].components[1].element;

            expect(qcuElement.instruction).to.equal(
              `<p>Le <highlighted-button word="chat" definition="${chatDefinition}">chat</highlighted-button> ?</p>`,
            );
            expect(qrocmElement.instruction).to.equal(
              `<p>Le <highlighted-button word="chien" definition="${chienDefinition}">chien</highlighted-button> ?</p>`,
            );
            expect(qrocmElement.proposals[0].content).to.deep.equal(qrocm.element.proposals[0].content);
            expect(qcuElement.proposals[0].content).to.deep.equal(qcu.element.proposals[0].content);
          });
        });

        describe('When module has feedbacks', function () {
          it('should enclose diagnoses content occurrences with a span tag', function () {
            // given
            const chienDefinition = 'Le meilleur ami des humains';
            const chatDefinition = 'Le meilleur ami des souris';
            const qcmDeclarative = {
              id: `22222222-2222-2222-2222-222222222223`,
              type: 'element',
              element: {
                type: 'qcm-declarative',
                instruction: '<p>Le chat ?</p>',
                proposals: [{ content: 'chat' }],
                feedback: { diagnosis: "<p>Oui ! C'est un chat</p>" },
              },
            };
            const qcm = {
              id: `22222222-2222-2222-2222-222222222224`,
              type: 'element',
              element: {
                type: 'qcm',
                instruction: '<p>Le chien ?</p>',
                proposals: [{ content: 'chien' }],
                feedbacks: {
                  valid: { state: 'Correct', diagnosis: "<p>Bravo c'est le chien !</p>" },
                  invalid: { state: 'Faux', diagnosis: "<p>Raté c'est un chat</p>" },
                },
              },
            };
            const qcuDiscovery = {
              id: `22222222-2222-2222-2222-222222222226`,
              type: 'element',
              element: {
                type: 'qcu-discovery',
                instruction: '<p>Le lapin ?</p>',
                proposals: [
                  {
                    id: '1',
                    content: '<p>Le lapin</p>',
                    feedback: {
                      diagnosis: '<p>Bien joué !</p>',
                    },
                  },
                  {
                    id: '2',
                    content: '<p>Le chat</p>',
                    feedback: {
                      diagnosis: '<p>Eh non ! Pas de chat mais un lapin</p>',
                    },
                  },
                ],
              },
            };

            const module = domainBuilder.buildModule({
              glossary: [
                { words: ['chien'], definition: chienDefinition },
                { words: ['chat', 'chaton'], definition: chatDefinition },
              ],
              sections: [
                {
                  id: `11111111-1111-1111-1111-111111111111`,
                  type: 'practise',
                  grains: [
                    {
                      id: `22222222-2222-2222-2222-222222222222`,
                      type: 'lesson',
                      title: 'Grain de test',
                      components: [qcmDeclarative, qcm, qcuDiscovery],
                    },
                  ],
                },
              ],
            });

            // when
            const result = highlightGlossaryWords(module);

            // then
            const qcmDeclarativeElement = result.sections[0].grains[0].components[0].element;
            const qcmElement = result.sections[0].grains[0].components[1].element;
            const qcuDiscoveryElement = result.sections[0].grains[0].components[2].element;

            expect(qcmDeclarativeElement.feedback.diagnosis).to.equal(
              `<p>Oui ! C'est un <highlighted-button word="chat" definition="${chatDefinition}">chat</highlighted-button></p>`,
            );
            expect(qcmElement.feedbacks.valid.diagnosis).to.equal(
              `<p>Bravo c'est le <highlighted-button word="chien" definition="${chienDefinition}">chien</highlighted-button> !</p>`,
            );
            expect(qcmElement.feedbacks.invalid.diagnosis).to.equal(
              `<p>Raté c'est un <highlighted-button word="chat" definition="${chatDefinition}">chat</highlighted-button></p>`,
            );

            expect(qcuDiscoveryElement.proposals[1].feedback.diagnosis).to.equal(
              `<p>Eh non ! Pas de <highlighted-button word="chat" definition="${chatDefinition}">chat</highlighted-button> mais un lapin</p>`,
            );

            expect(qcmDeclarativeElement.proposals[0].content).to.deep.equal(
              qcmDeclarative.element.proposals[0].content,
            );

            expect(qcuDiscoveryElement.proposals[0].content).to.deep.equal(qcuDiscovery.element.proposals[0].content);
            expect(qcuDiscoveryElement.proposals[1].content).to.deep.equal(qcuDiscovery.element.proposals[1].content);
          });
        });
      });

      describe('When module has stepper component', function () {
        it('should enclose glossary word occurrences with a span tag', function () {
          // given
          const chienDefinition = 'Le meilleur ami des humains';
          const chatDefinition = 'Le meilleur ami des souris';
          const qcmDeclarative = {
            type: 'qcm-declarative',
            instruction: '<p>Le chat ?</p>',
            proposals: [{ content: 'chat' }],
            feedback: { diagnosis: "<p>Oui ! C'est un chat</p>" },
          };
          const text = { type: 'text', content: '<p>réseau et chien</p>' };

          const module = domainBuilder.buildModule({
            glossary: [
              { words: ['chien'], definition: chienDefinition },
              { words: ['chat'], definition: chatDefinition },
            ],
            sections: [
              {
                id: `11111111-1111-1111-1111-111111111111`,
                type: 'practise',
                grains: [
                  {
                    id: `22222222-2222-2222-2222-222222222222`,
                    type: 'lesson',
                    title: 'Grain de test',
                    components: [
                      {
                        id: `22222222-2222-2222-2222-222222222223`,
                        type: 'stepper',
                        instruction: "<p>Ce texte s'affiche pour un stepper horizontal de type chat.</p>",
                        steps: [
                          {
                            elements: [qcmDeclarative, text],
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
          const result = highlightGlossaryWords(module);

          // then
          const stepperInstruction = result.sections[0].grains[0].components[0].instruction;
          const qcmDeclarativeElement = result.sections[0].grains[0].components[0].steps[0].elements[0];
          const textElement = result.sections[0].grains[0].components[0].steps[0].elements[1];

          expect(stepperInstruction).to.equal(
            `<p>Ce texte s'affiche pour un stepper horizontal de type <highlighted-button word="chat" definition="${chatDefinition}">chat</highlighted-button>.</p>`,
          );

          expect(qcmDeclarativeElement.instruction).to.equal(
            `<p>Le <highlighted-button word="chat" definition="${chatDefinition}">chat</highlighted-button> ?</p>`,
          );
          expect(qcmDeclarativeElement.feedback.diagnosis).to.equal(
            `<p>Oui ! C'est un <highlighted-button word="chat" definition="${chatDefinition}">chat</highlighted-button></p>`,
          );

          expect(textElement.content).to.equal(
            `<p>réseau et <highlighted-button word="chien" definition="${chienDefinition}">chien</highlighted-button></p>`,
          );
        });
      });

      describe('Matching cases', function () {
        it('should match case-insensitively and keep the glossary word as marker value', function () {
          // given
          const reseauDefinition = 'Des machines reliées';
          const module = domainBuilder.buildModule({
            glossary: [{ words: ['réseau', 'réseaux'], definition: reseauDefinition }],
            sections: [
              {
                id: `11111111-1111-1111-1111-111111111111`,
                type: 'practise',
                grains: [
                  {
                    id: `22222222-2222-2222-2222-222222222222`,
                    type: 'lesson',
                    title: 'Grain de test',
                    components: [
                      {
                        id: `22222222-2222-2222-2222-222222222223`,
                        type: 'element',
                        element: { type: 'text', content: '<p>réseau et RÉSEAU</p>' },
                      },
                    ],
                  },
                ],
              },
            ],
          });

          // when
          const result = highlightGlossaryWords(module);

          // then
          const firstElement = (moduleData) => moduleData.sections[0].grains[0].components[0].element;
          expect(firstElement(result).content).to.equal(
            `<p><highlighted-button word="réseau" definition="${reseauDefinition}">réseau</highlighted-button> et <highlighted-button word="réseau" definition="${reseauDefinition}">RÉSEAU</highlighted-button></p>`,
          );
        });

        it('should only match whole words, including accented ones', function () {
          // given
          const chatDefinition = 'Un félin';
          const cleDefinition = 'Un objet';
          const module = domainBuilder.buildModule({
            glossary: [
              { words: ['clé'], definition: cleDefinition },
              { words: ['chat'], definition: chatDefinition },
            ],
            sections: [
              {
                id: `11111111-1111-1111-1111-111111111111`,
                type: 'practise',
                grains: [
                  {
                    id: `22222222-2222-2222-2222-222222222222`,
                    type: 'lesson',
                    title: 'Grain de test',
                    components: [
                      {
                        id: `22222222-2222-2222-2222-222222222223`,
                        type: 'element',
                        element: { type: 'text', content: '<p>clés, clé. chaton, chats, chat, achat</p>' },
                      },
                    ],
                  },
                ],
              },
            ],
          });

          // when
          const result = highlightGlossaryWords(module);

          // then
          const firstElement = (moduleData) => moduleData.sections[0].grains[0].components[0].element;
          expect(firstElement(result).content).to.equal(
            `<p>clés, <highlighted-button word="clé" definition="${cleDefinition}">clé</highlighted-button>. chaton, chats, <highlighted-button word="chat" definition="${chatDefinition}">chat</highlighted-button>, achat</p>`,
          );
        });

        it('should not match word in a button or link tag', function () {
          // given
          const chatDefinition = 'Un félin';
          const module = domainBuilder.buildModule({
            glossary: [{ words: ['chat'], definition: chatDefinition }],
            sections: [
              {
                id: `11111111-1111-1111-1111-111111111111`,
                type: 'practise',
                grains: [
                  {
                    id: `22222222-2222-2222-2222-222222222222`,
                    type: 'lesson',
                    title: 'Grain de test',
                    components: [
                      {
                        id: `22222222-2222-2222-2222-222222222223`,
                        type: 'element',
                        element: {
                          type: 'text',
                          content:
                            '<p title="chat"><a href="/chat">Mon chat</a> <button>chat</button> <strong>chat</strong></p>',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          });

          // when
          const result = highlightGlossaryWords(module);

          // then
          const firstElement = (moduleData) => moduleData.sections[0].grains[0].components[0].element;
          expect(firstElement(result).content).to.equal(
            `<p title="chat"><a href="/chat">Mon chat</a> <button>chat</button> <strong><highlighted-button word="chat" definition="${chatDefinition}">chat</highlighted-button></strong></p>`,
          );
        });

        it('should match glossary words containing regex special characters literally', function () {
          // given
          const emailDefinition =
            "Message envoyé et reçu sous forme numérique par l'intermédiaire d'un réseau informatique, tel qu'Internet";
          const cppDefinition = 'Langage de programmation compilé';
          const reseauSocialDefinition =
            'Plateforme numérique qui offre un espace de contenu généré par les utilisateurs';
          const module = domainBuilder.buildModule({
            glossary: [
              {
                words: ['e-mail'],
                definition: emailDefinition,
              },
              {
                words: ['C++'],
                definition: cppDefinition,
              },
              {
                words: ['Réseau social'],
                definition: reseauSocialDefinition,
              },
            ],
            sections: [
              {
                id: `11111111-1111-1111-1111-111111111111`,
                type: 'practise',
                grains: [
                  {
                    id: `22222222-2222-2222-2222-222222222222`,
                    type: 'lesson',
                    title: 'Grain de test',
                    components: [
                      {
                        id: `22222222-2222-2222-2222-222222222223`,
                        type: 'element',
                        element: {
                          type: 'text',
                          content: '<p><em>E-mail</em> et C++, mais pas email ni Cpp. Réseau social aussi</p>',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          });

          // when
          const result = highlightGlossaryWords(module);

          // then
          const firstElement = (moduleData) => moduleData.sections[0].grains[0].components[0].element;
          expect(firstElement(result).content).to.equal(
            `<p><em><highlighted-button word="e-mail" definition="${emailDefinition}">E-mail</highlighted-button></em> et <highlighted-button word="C++" definition="${cppDefinition}">C++</highlighted-button>, mais pas email ni Cpp. <highlighted-button word="Réseau social" definition="${reseauSocialDefinition}">Réseau social</highlighted-button> aussi</p>`,
          );
        });

        it('should escape the definition so it does not break the highlighted button attribute', function () {
          // given
          const module = domainBuilder.buildModule({
            glossary: [{ words: ['chat'], definition: 'Un "félin" <domestique> & joueur' }],
            sections: [
              {
                id: `11111111-1111-1111-1111-111111111111`,
                type: 'practise',
                grains: [
                  {
                    id: `22222222-2222-2222-2222-222222222222`,
                    type: 'lesson',
                    title: 'Grain de test',
                    components: [
                      {
                        id: `22222222-2222-2222-2222-222222222223`,
                        type: 'element',
                        element: { type: 'text', content: '<p>Mon chat</p>' },
                      },
                    ],
                  },
                ],
              },
            ],
          });

          // when
          const result = highlightGlossaryWords(module);

          // then
          const firstElement = (moduleData) => moduleData.sections[0].grains[0].components[0].element;
          expect(firstElement(result).content).to.equal(
            '<p>Mon <highlighted-button word="chat" definition="Un &quot;félin&quot; &lt;domestique&gt; &amp; joueur">chat</highlighted-button></p>',
          );
        });
      });
    });
  });
});
