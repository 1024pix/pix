import { expect } from 'chai';

import { highlightGlossaryWords } from '../../../../../src/devcomp/domain/services/glossary-highlighter.js';

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

    describe('When glossary is not empty', function () {
      describe('When module has element component', function () {
        describe('When module has a text element', function () {
          it('should enclose text element content words occurrences with a span tag', function () {
            // given
            const module = {
              glossary: [{ words: ['réseau'], definition: 'Des machines reliées' }],
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
            };

            // when
            const result = highlightGlossaryWords(module);

            // then
            const firstElement = (moduleData) => moduleData.sections[0].grains[0].components[0].element;
            expect(firstElement(result).content).to.equal(
              '<p><span data-glossary-word="réseau">réseau</span> et <span data-glossary-word="réseau">réseau</span></p>',
            );
          });
        });

        describe('When module has an element with an instruction field', function () {
          it('should enclose instruction content occurrences with a span tag', function () {
            // given
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

            const module = {
              glossary: [
                { words: ['chien'], definition: 'Le meilleur ami des humains' },
                { words: ['chat'], definition: 'Le meilleur ami des souris' },
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
            };

            // when
            const result = highlightGlossaryWords(module);

            // then
            const qcuElement = result.sections[0].grains[0].components[0].element;
            const qrocmElement = result.sections[0].grains[0].components[1].element;

            expect(qcuElement.instruction).to.equal('<p>Le <span data-glossary-word="chat">chat</span> ?</p>');
            expect(qrocmElement.instruction).to.equal('<p>Le <span data-glossary-word="chien">chien</span> ?</p>');
          });
        });

        describe('When module has feedbacks', function () {
          it('should enclose diagnoses content occurrences with a span tag', function () {
            // given
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

            const module = {
              glossary: [
                { words: ['chien'], definition: 'Le meilleur ami des humains' },
                { words: ['chat'], definition: 'Le meilleur ami des souris' },
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
            };

            // when
            const result = highlightGlossaryWords(module);

            // then
            const qcmDeclarativeElement = result.sections[0].grains[0].components[0].element;
            const qcmElement = result.sections[0].grains[0].components[1].element;
            const qcuDiscoveryElement = result.sections[0].grains[0].components[2].element;

            expect(qcmDeclarativeElement.feedback.diagnosis).to.equal(
              '<p>Oui ! C\'est un <span data-glossary-word="chat">chat</span></p>',
            );
            expect(qcmElement.feedbacks.valid.diagnosis).to.equal(
              '<p>Bravo c\'est le <span data-glossary-word="chien">chien</span> !</p>',
            );
            expect(qcmElement.feedbacks.invalid.diagnosis).to.equal(
              '<p>Raté c\'est un <span data-glossary-word="chat">chat</span></p>',
            );

            expect(qcuDiscoveryElement.proposals[1].feedback.diagnosis).to.equal(
              '<p>Eh non ! Pas de <span data-glossary-word="chat">chat</span> mais un lapin</p>',
            );
          });
        });
      });

      describe('When module has stepper component', function () {
        it('should enclose glossary word occurrences with a span tag', function () {
          // given
          const qcmDeclarative = {
            type: 'qcm-declarative',
            instruction: '<p>Le chat ?</p>',
            proposals: [{ content: 'chat' }],
            feedback: { diagnosis: "<p>Oui ! C'est un chat</p>" },
          };
          const text = { type: 'text', content: '<p>réseau et chien</p>' };

          const module = {
            glossary: [
              { words: ['chien'], definition: 'Le meilleur ami des humains' },
              { words: ['chat'], definition: 'Le meilleur ami des souris' },
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
          };

          // when
          const result = highlightGlossaryWords(module);

          // then
          const stepperInstruction = result.sections[0].grains[0].components[0].instruction;
          const qcmDeclarativeElement = result.sections[0].grains[0].components[0].steps[0].elements[0];
          const textElement = result.sections[0].grains[0].components[0].steps[0].elements[1];

          expect(stepperInstruction).to.equal(
            '<p>Ce texte s\'affiche pour un stepper horizontal de type <span data-glossary-word="chat">chat</span>.</p>',
          );

          expect(qcmDeclarativeElement.instruction).to.equal('<p>Le <span data-glossary-word="chat">chat</span> ?</p>');
          expect(qcmDeclarativeElement.feedback.diagnosis).to.equal(
            '<p>Oui ! C\'est un <span data-glossary-word="chat">chat</span></p>',
          );

          expect(textElement.content).to.equal('<p>réseau et <span data-glossary-word="chien">chien</span></p>');
        });
      });
    });
  });
});
