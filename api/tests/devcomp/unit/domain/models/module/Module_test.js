import { ModuleInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { Image } from '../../../../../../src/devcomp/domain/models/element/Image.js';
import { QCM } from '../../../../../../src/devcomp/domain/models/element/QCM.js';
import { QCU } from '../../../../../../src/devcomp/domain/models/element/QCU.js';
import { QROCM } from '../../../../../../src/devcomp/domain/models/element/QROCM.js';
import { Text } from '../../../../../../src/devcomp/domain/models/element/Text.js';
import { Video } from '../../../../../../src/devcomp/domain/models/element/Video.js';
import { Module } from '../../../../../../src/devcomp/domain/models/module/Module.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Module | Module', function () {
  describe('#constructor', function () {
    it('should create a module and keep attributes', function () {
      // given
      const id = 1;
      const slug = 'les-adresses-email';
      const title = 'Les adresses email';
      const grains = [Symbol('text')];
      const transitionTexts = [];
      const details = Symbol('details');

      // when
      const module = new Module({ id, slug, title, grains, details, transitionTexts });

      // then
      expect(module.id).to.equal(id);
      expect(module.slug).to.equal(slug);
      expect(module.title).to.equal(title);
      expect(module.transitionTexts).to.equal(transitionTexts);
      expect(module.grains).to.have.length(grains.length);
      expect(module.details).to.deep.equal(details);
    });

    describe('if a module does not have an id', function () {
      it('should throw an error', function () {
        expect(() => new Module({})).to.throw('The id is required for a module');
      });
    });

    describe('if a module does not have a title', function () {
      it('should throw an error', function () {
        expect(() => new Module({ id: 1 })).to.throw('The title is required for a module');
      });
    });

    describe('if a module does not have a slug', function () {
      it('should throw an error', function () {
        expect(() => new Module({ id: 1, title: '' })).to.throw('The slug is required for a module');
      });
    });

    describe('if a module does not have grains', function () {
      it('should throw an error', function () {
        expect(
          () =>
            new Module({
              id: 'id_module_1',
              slug: 'bien-ecrire-son-adresse-mail',
              title: 'Bien écrire son adresse mail',
            }),
        ).to.throw('A list of grains is required for a module');
      });
    });

    describe('if a module has grains with the wrong type', function () {
      it('should throw an error', function () {
        expect(
          () =>
            new Module({
              id: 'id_module_1',
              slug: 'bien-ecrire-son-adresse-mail',
              title: 'Bien écrire son adresse mail',
              grains: 'elements',
            }),
        ).to.throw(`A module should have a list of grains`);
      });
    });

    describe('if a module does not have details', function () {
      it('should throw an error', function () {
        expect(
          () =>
            new Module({
              id: 'id_module_1',
              slug: 'bien-ecrire-son-adresse-mail',
              title: 'Bien écrire son adresse mail',
              grains: [],
            }),
        ).to.throw('The details are required for a module');
      });
    });

    describe('#getGrainByElementId', function () {
      it('should return the parent grain of the element with given id', function () {
        // given
        const elementId = 'elementId';
        const id = 1;
        const slug = 'les-adresses-email';
        const title = 'Les adresses email';
        const element = { id: elementId };
        // ToDo PIX-12363 migrate to components
        const expectedGrain = { elements: [element] };
        const details = Symbol('details');

        // when
        const foundGrain = new Module({ id, slug, title, grains: [expectedGrain], details }).getGrainByElementId(
          elementId,
        );

        // then
        expect(foundGrain).to.deep.equal(expectedGrain);
      });

      it('should throw an error if grain does not exist', function () {
        // given
        const elementId = 'elementId';
        const id = 1;
        const slug = 'les-adresses-email';
        const title = 'Les adresses email';
        const element = { id: elementId };
        // ToDo PIX-12363 migrate to components
        const grain = { elements: [element] };
        const details = Symbol('details');
        const module = new Module({ id, slug, title, grains: [grain], details });

        // when
        const error = catchErrSync(module.getGrainByElementId, module)('another-grain-id');

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    describe.skip('Skip those tests, we keep them in order to discuss with business', function () {
      describe('given a module being created', function () {
        describe('given a module with less than two grains', function () {
          // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
          // eslint-disable-next-line no-empty-function
          it('should throw error', function () {});
        });

        describe('given a module with two grains which are the same', function () {
          // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
          // eslint-disable-next-line no-empty-function
          it('should throw an error', function () {});
        });

        describe('a grain already associated to another module', function () {
          // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
          // eslint-disable-next-line no-empty-function
          it('will not throw an error', function () {});
        });
      });

      describe('given a published module', function () {
        describe('given a module with less than two grains', function () {
          // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
          // eslint-disable-next-line no-empty-function
          it('should throw error', function () {});
        });

        describe('if a module does not have a description', function () {
          // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
          // eslint-disable-next-line no-empty-function
          it('should throw an error', function () {});
        });

        describe('given a module with two grains which are the same', function () {
          // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
          // eslint-disable-next-line no-empty-function
          it('should throw an error', function () {});
        });
      });
    });
  });

  describe('#toDomain', function () {
    it('should throw an ModuleInstantiateError if data is incorrect', function () {
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
      const error = catchErrSync(Module.toDomain)(dataWithIncorrectTransitionText);

      // then
      expect(error).to.be.an.instanceOf(ModuleInstantiationError);
      expect(error.message).to.deep.equal(
        'All the transition texts should be linked to a grain contained in the module.',
      );
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
      const module = Module.toDomain(moduleData);

      // then
      expect(module).to.be.an.instanceOf(Module);
      expect(module.grains).not.to.be.empty;
      for (const grain of module.grains) {
        expect(grain.components).not.to.be.empty;
      }
    });

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
      const module = Module.toDomain(moduleData);

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
      const module = Module.toDomain(moduleData);

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
      const module = Module.toDomain(moduleData);

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
      const module = Module.toDomain(moduleData);

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
      const module = Module.toDomain(moduleData);

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
      const module = Module.toDomain(moduleData);

      // then
      expect(module.grains[0].components[0].element).to.be.an.instanceOf(QROCM);
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
      const module = Module.toDomain(moduleData);

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
      const module = Module.toDomain(moduleData);

      // then
      expect(module).to.be.an.instanceOf(Module);
      expect(module.grains).not.to.be.empty;
      expect(module.grains[0].components).to.have.length(1);
      expect(module.grains[0].components[0].element).not.to.be.empty;
    });
  });

  describe('#toDomainForVerification', function () {
    it('should throw an ModuleInstantiateError if data is incorrect', function () {
      // given
      const feedbacks = { valid: 'valid', invalid: 'invalid' };
      const proposals = [
        { id: '1', content: 'toto' },
        { id: '2', content: 'foo' },
      ];

      const dataWithMissingSolutionForQCU = {
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
            // ToDo PIX-12363 migrate to components
            components: [
              {
                type: 'element',
                element: {
                  id: '123',
                  instruction: 'instruction',
                  locales: ['fr-FR'],
                  proposals,
                  feedbacks,
                  type: 'qcu',
                },
              },
            ],
          },
        ],
      };

      // when
      const error = catchErrSync(Module.toDomainForVerification)(dataWithMissingSolutionForQCU);

      // then
      expect(error).to.be.an.instanceOf(ModuleInstantiationError);
      expect(error.message).to.deep.equal('The solution is required for a verification QCU');
    });
  });
});
