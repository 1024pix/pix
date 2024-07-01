import { ModuleInstantiationError } from '../../../../../src/devcomp/domain/errors.js';
import { ComponentStepper } from '../../../../../src/devcomp/domain/models/component/ComponentStepper.js';
import { Step } from '../../../../../src/devcomp/domain/models/component/Step.js';
import { Image } from '../../../../../src/devcomp/domain/models/element/Image.js';
import { QCM } from '../../../../../src/devcomp/domain/models/element/QCM.js';
import { QCU } from '../../../../../src/devcomp/domain/models/element/QCU.js';
import { QROCM } from '../../../../../src/devcomp/domain/models/element/QROCM.js';
import { Text } from '../../../../../src/devcomp/domain/models/element/Text.js';
import { Video } from '../../../../../src/devcomp/domain/models/element/Video.js';
import { Module } from '../../../../../src/devcomp/domain/models/module/Module.js';
import { ModuleFactory } from '../../../../../src/devcomp/infrastructure/factories/module-factory.js';
import { logger } from '../../../../../src/shared/infrastructure/utils/logger.js';
import { catchErrSync, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Infrastructure | Factories | Module ', function () {
  describe('#toDomain', function () {
    describe('when data is incorrect', function () {
      it('should throw an ModuleInstantiateError', function () {
        // given
        const nonExistingGrainId = 'v312c33d-e7c9-4a69-9ba0-913957b8f7df';
        const dataWithIncorrectTransitionText = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          transitionTexts: [
            {
              content: '<p>Text</p>',
              grainId: nonExistingGrainId,
            },
          ],
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'element',
                  element: {
                    id: '84726001-1665-457d-8f13-4a74dc4768ea',
                    type: 'text',
                    content: '<h3>Content</h3>',
                  },
                },
              ],
            },
          ],
        };

        // when
        const error = catchErrSync(ModuleFactory.toDomain)(dataWithIncorrectTransitionText);

        // then
        expect(error).to.be.an.instanceOf(ModuleInstantiationError);
        expect(error.message).to.deep.equal(
          'All the transition texts should be linked to a grain contained in the module.',
        );
      });

      describe('when a component has an unknown type', function () {
        it('should log the error', function () {
          // given
          const moduleData = {
            id: '6282925d-4775-4bca-b513-4c3009ec5886',
            slug: 'title',
            title: 'title',
            details: {
              image: 'https://images.pix.fr/modulix/placeholder-details.svg',
              description: 'Description',
              duration: 5,
              level: 'Débutant',
              objectives: ['Objective 1'],
            },
            grains: [
              {
                id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
                type: 'lesson',
                title: 'title',
                components: [
                  {
                    type: 'unknown',
                    element: {
                      id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
                      type: 'text',
                      content: '<p>content</p>',
                      alt: 'Alternative',
                      alternativeText: 'Alternative textuelle',
                    },
                  },
                ],
              },
            ],
          };
          sinon.stub(logger, 'warn').returns();

          // when
          ModuleFactory.toDomain(moduleData);

          // then
          expect(logger.warn).to.have.been.calledWithExactly({
            event: 'module_component_type_unknown',
            message: 'Component inconnu: unknown',
          });
        });
      });

      describe('when an element has an unknown type', function () {
        it('should log the error', function () {
          // given
          const moduleData = {
            id: '6282925d-4775-4bca-b513-4c3009ec5886',
            slug: 'title',
            title: 'title',
            details: {
              image: 'https://images.pix.fr/modulix/placeholder-details.svg',
              description: 'Description',
              duration: 5,
              level: 'Débutant',
              objectives: ['Objective 1'],
            },
            grains: [
              {
                id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
                type: 'lesson',
                title: 'title',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
                      type: 'unknown',
                      content: '<p>content</p>',
                      alt: 'Alternative',
                      alternativeText: 'Alternative textuelle',
                    },
                  },
                ],
              },
            ],
          };
          sinon.stub(logger, 'warn').returns();

          // when
          ModuleFactory.toDomain(moduleData);

          // then
          expect(logger.warn).to.have.been.calledWithExactly({
            event: 'module_element_type_unknown',
            message: 'Element inconnu: unknown',
          });
        });
      });

      describe('when a qrocm has an unknown proposal type', function () {
        it('should log the error', function () {
          // given
          const moduleData = {
            id: '6282925d-4775-4bca-b513-4c3009ec5886',
            slug: 'title',
            title: 'title',
            details: {
              image: 'https://images.pix.fr/modulix/placeholder-details.svg',
              description: 'Description',
              duration: 5,
              level: 'Débutant',
              objectives: ['Objective 1'],
            },
            grains: [
              {
                id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
                type: 'lesson',
                title: 'title',
                components: [
                  {
                    type: 'element',
                    element: {
                      id: 'c23436d4-6261-49f1-b50d-13a547529c29',
                      type: 'qrocm',
                      instruction: '<p>Compléter le texte suivant :</p>',
                      proposals: [
                        {
                          type: 'unknown',
                          content: '<span>Pix est un</span>',
                        },
                      ],
                      feedbacks: {
                        valid:
                          '<span class="feedback__state">Correct&#8239;!</span><p> vous nous connaissez bien&nbsp;<span aria-hidden="true">🎉</span></p>',
                        invalid:
                          '<span class="feedback__state">Incorrect&#8239;!</span><p> vous y arriverez la prochaine fois&#8239;!</p>',
                      },
                    },
                  },
                ],
              },
            ],
          };
          sinon.stub(logger, 'warn').returns();

          // when
          ModuleFactory.toDomain(moduleData);

          // then
          expect(logger.warn).to.have.been.calledWithExactly('Type de proposal inconnu: unknown');
        });
      });
    });

    it('should instantiate a Module with components', function () {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'title',
        title: 'title',
        details: {
          image: 'https://images.pix.fr/modulix/placeholder-details.svg',
          description: 'Description',
          duration: 5,
          level: 'Débutant',
          objectives: ['Objective 1'],
        },
        grains: [
          {
            id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
            type: 'lesson',
            title: 'title',
            components: [
              {
                type: 'element',
                element: {
                  id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
                  type: 'image',
                  url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg',
                  alt: 'Alternative',
                  alternativeText: 'Alternative textuelle',
                },
              },
            ],
          },
        ],
      };

      // when
      const module = ModuleFactory.toDomain(moduleData);

      // then
      expect(module).to.be.an.instanceOf(Module);
      expect(module.grains).not.to.be.empty;
      for (const grain of module.grains) {
        expect(grain.components).not.to.be.empty;
      }
    });

    describe('With ComponentElement', function () {
      it('should instantiate a Module with a ComponentElement which contains an Image Element', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'element',
                  element: {
                    id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
                    type: 'image',
                    url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg',
                    alt: 'Alternative',
                    alternativeText: 'Alternative textuelle',
                  },
                },
              ],
            },
          ],
        };

        // when
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0].element).to.be.an.instanceOf(Image);
      });

      it('should instantiate a Module with a ComponentElement which contains a Text Element', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'element',
                  element: {
                    id: '84726001-1665-457d-8f13-4a74dc4768ea',
                    type: 'text',
                    content: '<h3>Content</h3>',
                  },
                },
              ],
            },
          ],
        };

        // when
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0].element).to.be.an.instanceOf(Text);
      });

      it('should instantiate a Module with a ComponentElement which contains a Video Element', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'element',
                  element: {
                    id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
                    type: 'video',
                    title: 'Le format des adress mail',
                    url: 'https://videos.pix.fr/modulix/chat_animation_2.webm',
                    subtitles: 'Insert subtitles here',
                    transcription: 'Insert transcription here',
                  },
                },
              ],
            },
          ],
        };

        // when
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0].element).to.be.an.instanceOf(Video);
      });

      it('should instantiate a Module with a ComponentElement which contains a QCU Element', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'element',
                  element: {
                    id: 'ba78dead-a806-4954-b408-e8ef28d28fab',
                    type: 'qcu',
                    instruction: '<p>L’adresse mail M3g4Cool1415@gmail.com est correctement écrite ?</p>',
                    proposals: [
                      {
                        id: '1',
                        content: 'Vrai',
                      },
                      {
                        id: '2',
                        content: 'Faux',
                      },
                    ],
                    feedbacks: {
                      valid:
                        '<p>On peut avoir des chiffres n’importe où dans l’identifiant. On peut aussi utiliser des majuscules.</p>',
                      invalid:
                        '<p>On peut avoir des chiffres n’importe où dans l’identifiant. On peut aussi utiliser des majuscules.</p>',
                    },
                    solution: '1',
                  },
                },
              ],
            },
          ],
        };

        // when
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0].element).to.be.an.instanceOf(QCU);
      });

      it('should instantiate a Module with a ComponentElement which contains a QCM Element', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'element',
                  element: {
                    id: '30701e93-1b4d-4da4-b018-fa756c07d53f',
                    type: 'qcm',
                    instruction: '<p>Quels sont les 3 piliers de Pix ?</p>',
                    proposals: [
                      {
                        id: '1',
                        content: 'Evaluer ses connaissances et savoir-faire sur 16 compétences du numérique',
                      },
                      {
                        id: '2',
                        content: 'Développer son savoir-faire sur les jeux de type TPS',
                      },
                      {
                        id: '3',
                        content: 'Développer ses compétences numériques',
                      },
                      {
                        id: '4',
                        content: 'Certifier ses compétences Pix',
                      },
                      {
                        id: '5',
                        content: 'Evaluer ses compétences de logique et compréhension mathématique',
                      },
                    ],
                    feedbacks: {
                      valid: '<p>Correct ! Vous nous avez bien cernés :)</p>',
                      invalid: '<p>Et non ! Pix sert à évaluer, certifier et développer ses compétences numériques.',
                    },
                    solutions: ['1', '3', '4'],
                  },
                },
              ],
            },
          ],
        };

        // when
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0].element).to.be.an.instanceOf(QCM);
      });

      it('should instantiate a Module with a ComponentElement which contains a QROCM Element', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'element',
                  element: {
                    id: '98c51fa7-03b7-49b1-8c5e-49341d35909c',
                    type: 'qrocm',
                    instruction:
                      "<p>Pour être sûr que tout est clair, complétez le texte ci-dessous <span aria-hidden='true'>🧩</span></p><p>Si vous avez besoin d’aide, revenez en arrière <span aria-hidden='true'>⬆️</span></p>",
                    proposals: [
                      {
                        type: 'text',
                        content: '<p>Le symbole</>',
                      },
                      {
                        input: 'symbole',
                        type: 'input',
                        inputType: 'text',
                        size: 1,
                        display: 'inline',
                        placeholder: '',
                        ariaLabel: 'Réponse 1',
                        defaultValue: '',
                        tolerances: ['t1'],
                        solutions: ['@'],
                      },
                      {
                        input: 'premiere-partie',
                        type: 'select',
                        display: 'inline',
                        placeholder: '',
                        ariaLabel: 'Réponse 2',
                        defaultValue: '',
                        tolerances: [],
                        options: [
                          {
                            id: '1',
                            content: "l'identifiant",
                          },
                          {
                            id: '2',
                            content: "le fournisseur d'adresse mail",
                          },
                        ],
                        solutions: ['1'],
                      },
                    ],
                    feedbacks: {
                      valid: '<p>Bravo ! 🎉 </p>',
                      invalid: "<p class='pix-list-inline'>Et non !</p>",
                    },
                  },
                },
              ],
            },
          ],
        };

        // when
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0].element).to.be.an.instanceOf(QROCM);
      });
    });

    describe('With ComponentStepper', function () {
      it('should instantiate a Module with a ComponentStepper which contains an Image Element', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'stepper',
                  steps: [
                    {
                      elements: [
                        {
                          id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
                          type: 'image',
                          url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg',
                          alt: "Dessin détaillé dans l'alternative textuelle",
                          alternativeText: "Dessin d'un ordinateur dans un univers spatial.",
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
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0]).to.be.an.instanceOf(ComponentStepper);
        expect(module.grains[0].components[0].steps[0]).to.be.an.instanceOf(Step);
        expect(module.grains[0].components[0].steps[0].elements[0]).to.be.an.instanceOf(Image);
      });

      it('should instantiate a Module with a ComponentStepper which contains a Text Element', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
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
                  ],
                },
              ],
            },
          ],
        };

        // when
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0]).to.be.an.instanceOf(ComponentStepper);
        expect(module.grains[0].components[0].steps[0]).to.be.an.instanceOf(Step);
        expect(module.grains[0].components[0].steps[0].elements[0]).to.be.an.instanceOf(Text);
      });

      it('should instantiate a Module with a ComponentStepper which contains a Video Element', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'stepper',
                  steps: [
                    {
                      elements: [
                        {
                          id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
                          type: 'video',
                          title: 'Vidéo de présentation de Pix',
                          url: 'https://videos.pix.fr/modulix/didacticiel/presentation.mp4',
                          subtitles: '',
                          transcription:
                            '<p>Le numérique évolue en permanence, vos compétences aussi, pour travailler, communiquer et s\'informer, se déplacer, réaliser des démarches, un enjeu tout au long de la vie.</p><p>Sur <a href="https://pix.fr" target="blank">pix.fr</a>, testez-vous et cultivez vos compétences numériques.</p><p>Les tests Pix sont personnalisés, les questions s\'adaptent à votre niveau, réponse après réponse.</p><p>Évaluez vos connaissances et savoir-faire sur 16 compétences, dans 5 domaines, sur 5 niveaux de débutants à confirmer, avec des mises en situation ludiques, recherches en ligne, manipulation de fichiers et de données, culture numérique...</p><p>Allez à votre rythme, vous pouvez arrêter et reprendre quand vous le voulez.</p><p>Toutes les 5 questions, découvrez vos résultats et progressez grâce aux astuces et aux tutos.</p><p>En relevant les défis Pix, vous apprendrez de nouvelles choses et aurez envie d\'aller plus loin.</p><p>Vous pensez pouvoir faire mieux&#8239;?</p><p>Retentez les tests et améliorez votre score.</p><p>Faites reconnaître officiellement votre niveau en passant la certification Pix, reconnue par l\'État et le monde professionnel.</p><p>Pix&nbsp;: le service public en ligne pour évaluer, développer et certifier ses compétences numériques.</p>',
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
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0]).to.be.an.instanceOf(ComponentStepper);
        expect(module.grains[0].components[0].steps[0]).to.be.an.instanceOf(Step);
        expect(module.grains[0].components[0].steps[0].elements[0]).to.be.an.instanceOf(Video);
      });

      it('should instantiate a Module with a ComponentStepper which contains a QCU Element', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'stepper',
                  steps: [
                    {
                      elements: [
                        {
                          id: '71de6394-ff88-4de3-8834-a40057a50ff4',
                          type: 'qcu',
                          instruction: '<p>Pix évalue 16 compétences numériques différentes.</p>',
                          proposals: [
                            {
                              id: '1',
                              content: 'Vrai',
                            },
                            {
                              id: '2',
                              content: 'Faux',
                            },
                          ],
                          feedbacks: {
                            valid: '<p>Correct&#8239;! Ces 16 compétences sont rangées dans 5 domaines.</p>',
                            invalid:
                              '<p>Incorrect. Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>!</p>',
                          },
                          solution: '1',
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
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0]).to.be.an.instanceOf(ComponentStepper);
        expect(module.grains[0].components[0].steps[0]).to.be.an.instanceOf(Step);
        expect(module.grains[0].components[0].steps[0].elements[0]).to.be.an.instanceOf(QCU);
      });

      it('should instantiate a Module with a ComponentStepper which contains a QCM Element', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'stepper',
                  steps: [
                    {
                      elements: [
                        {
                          id: '30701e93-1b4d-4da4-b018-fa756c07d53f',
                          type: 'qcm',
                          instruction: '<p>Quels sont les 3 piliers de Pix&#8239;?</p>',
                          proposals: [
                            {
                              id: '1',
                              content: 'Evaluer ses connaissances et savoir-faire sur 16 compétences du numérique',
                            },
                            {
                              id: '2',
                              content: 'Développer son savoir-faire sur les jeux de type TPS',
                            },
                            {
                              id: '3',
                              content: 'Développer ses compétences numériques',
                            },
                            {
                              id: '4',
                              content: 'Certifier ses compétences Pix',
                            },
                            {
                              id: '5',
                              content: 'Evaluer ses compétences de logique et compréhension mathématique',
                            },
                          ],
                          feedbacks: {
                            valid: '<p>Correct&#8239;! Vous nous avez bien cernés&nbsp;:)</p>',
                            invalid:
                              '<p>Et non&#8239;! Pix sert à évaluer, certifier et développer ses compétences numériques.</p>',
                          },
                          solutions: ['1', '3', '4'],
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
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0]).to.be.an.instanceOf(ComponentStepper);
        expect(module.grains[0].components[0].steps[0]).to.be.an.instanceOf(Step);
        expect(module.grains[0].components[0].steps[0].elements[0]).to.be.an.instanceOf(QCM);
      });

      it('should instantiate a Module with a ComponentStepper which contains a QROCM Element', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'stepper',
                  steps: [
                    {
                      elements: [
                        {
                          id: 'c23436d4-6261-49f1-b50d-13a547529c29',
                          type: 'qrocm',
                          instruction: '<p>Compléter le texte suivant :</p>',
                          proposals: [
                            {
                              type: 'text',
                              content: '<span>Pix est un</span>',
                            },
                            {
                              input: 'pix-name',
                              type: 'input',
                              inputType: 'text',
                              size: 10,
                              display: 'inline',
                              placeholder: '',
                              ariaLabel: 'Mot à trouver',
                              defaultValue: '',
                              tolerances: ['t1', 't3'],
                              solutions: ['Groupement'],
                            },
                            {
                              type: 'text',
                              content: "<span>d'intérêt public qui a été créée en</span>",
                            },
                            {
                              input: 'pix-birth',
                              type: 'input',
                              inputType: 'text',
                              size: 10,
                              display: 'inline',
                              placeholder: '',
                              ariaLabel: 'Année à trouver',
                              defaultValue: '',
                              tolerances: [],
                              solutions: ['2016'],
                            },
                          ],
                          feedbacks: {
                            valid:
                              '<p>Correct&#8239;! vous nous connaissez bien&nbsp;<span aria-hidden="true">🎉</span></p>',
                            invalid: '<p>Incorrect&#8239;! vous y arriverez la prochaine fois&#8239;!</p>',
                          },
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
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0]).to.be.an.instanceOf(ComponentStepper);
        expect(module.grains[0].components[0].steps[0]).to.be.an.instanceOf(Step);
        expect(module.grains[0].components[0].steps[0].elements[0]).to.be.an.instanceOf(QROCM);
      });

      it('should filter out unknown element type', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
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
                        {
                          id: '16ad694a-848f-456d-95a6-c488350c3ed7',
                          type: 'unknown',
                          content: 'Should not be added to the grain',
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
        const module = ModuleFactory.toDomain(moduleData);

        // then
        expect(module.grains[0].components[0]).to.be.an.instanceOf(ComponentStepper);
        expect(module.grains[0].components[0].steps[0]).to.be.an.instanceOf(Step);
        expect(module.grains[0].components[0].steps[0].elements).to.have.length(1);
        expect(module.grains[0].components[0].steps[0].elements[0]).to.be.an.instanceOf(Text);
      });

      it('should filter out steps with only unknown element type', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
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
                          id: '16ad694a-848f-456d-95a6-c488350c3ed7',
                          type: 'unknown',
                          content: 'Should not be added to the grain',
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
        const error = catchErrSync(ModuleFactory.toDomain)(moduleData);

        // then
        expect(error).to.be.an.instanceOf(ModuleInstantiationError);
        expect(error.message).to.deep.equal('A step should contain at least one element');
      });

      it('should filter out stepper with only unknown element type', function () {
        // given
        const moduleData = {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          slug: 'title',
          title: 'title',
          details: {
            image: 'https://images.pix.fr/modulix/placeholder-details.svg',
            description: 'Description',
            duration: 5,
            level: 'Débutant',
            objectives: ['Objective 1'],
          },
          grains: [
            {
              id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
              type: 'lesson',
              title: 'title',
              components: [
                {
                  type: 'stepper',
                  steps: [
                    {
                      elements: [
                        {
                          id: '16ad694a-848f-456d-95a6-c488350c3ed7',
                          type: 'unknown',
                          content: 'Should not be added to the grain',
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
        const error = catchErrSync(ModuleFactory.toDomain)(moduleData);

        // then
        expect(error).to.be.an.instanceOf(ModuleInstantiationError);
        expect(error.message).to.deep.equal('A step should contain at least one element');
      });
    });

    it('should filter out unknown component types', function () {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'title',
        title: 'title',
        details: {
          image: 'https://images.pix.fr/modulix/placeholder-details.svg',
          description: 'Description',
          duration: 5,
          level: 'Débutant',
          objectives: ['Objective 1'],
        },
        grains: [
          {
            id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
            type: 'lesson',
            title: 'title',
            components: [
              {
                type: 'element',
                element: {
                  id: '84726001-1665-457d-8f13-4a74dc4768ea',
                  type: 'text',
                  content: '<h3>Content</h3>',
                },
              },
              {
                type: 'unknown',
                unknown: {
                  id: '16ad694a-848f-456d-95a6-c488350c3ed7',
                  type: 'text',
                  content: '<h3>Content</h3>',
                },
              },
            ],
          },
        ],
      };

      // when
      const module = ModuleFactory.toDomain(moduleData);

      // then
      expect(module).to.be.an.instanceOf(Module);
      expect(module.grains).not.to.be.empty;
      expect(module.grains[0].components).to.have.length(1);
      expect(module.grains[0].components[0].element).not.to.be.empty;
    });

    it('should filter out component if element type is unknown', function () {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'title',
        title: 'title',
        details: {
          image: 'https://images.pix.fr/modulix/placeholder-details.svg',
          description: 'Description',
          duration: 5,
          level: 'Débutant',
          objectives: ['Objective 1'],
        },
        grains: [
          {
            id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
            type: 'lesson',
            title: 'title',
            components: [
              {
                type: 'element',
                element: {
                  id: '84726001-1665-457d-8f13-4a74dc4768ea',
                  type: 'text',
                  content: '<h3>Content</h3>',
                },
              },
              {
                type: 'element',
                element: {
                  id: '16ad694a-848f-456d-95a6-c488350c3ed7',
                  type: 'unknown',
                  content: 'Should not be added to the grain',
                },
              },
            ],
          },
        ],
      };

      // when
      const module = ModuleFactory.toDomain(moduleData);

      // then
      expect(module).to.be.an.instanceOf(Module);
      expect(module.grains).not.to.be.empty;
      expect(module.grains[0].components).to.have.length(1);
      expect(module.grains[0].components[0].element).not.to.be.empty;
    });
  });
});
