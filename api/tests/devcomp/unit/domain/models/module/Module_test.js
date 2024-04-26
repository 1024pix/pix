import { ModuleInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
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
    describe('without components', function () {
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
              elements: [
                {
                  id: '84726001-1665-457d-8f13-4a74dc4768ea',
                  type: 'text',
                  content: '<h3>Content</h3>',
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

      it('should instanciate a Module with only elements', function () {
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
              elements: [
                {
                  id: '84726001-1665-457d-8f13-4a74dc4768ea',
                  type: 'text',
                  content: '<h3>Content</h3>',
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
          expect(grain.elements).not.to.be.empty;
          expect(grain.components).to.be.undefined;
        }
      });

      it('should filter out unknown element types', function () {
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
              elements: [
                {
                  id: '84726001-1665-457d-8f13-4a74dc4768ea',
                  type: 'text',
                  content: '<h3>Content</h3>',
                },
                {
                  id: '16ad694a-848f-456d-95a6-c488350c3ed7',
                  type: 'unknown',
                  content: 'Should not be added to the grain',
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
        expect(module.grains[0].elements).to.have.length(1);
      });
    });

    describe('with components', function () {
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
              elements: [
                {
                  id: '84726001-1665-457d-8f13-4a74dc4768ea',
                  type: 'text',
                  content: '<h3>Content</h3>',
                },
              ],
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

      it('should throw an ModuleInstantiateError if module is present without elements', function () {
        // given
        const moduleDataWithoutElements = {
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
        const error = catchErrSync(Module.toDomain)(moduleDataWithoutElements);

        // then
        expect(error).to.be.an.instanceOf(ModuleInstantiationError);
        expect(error.message).to.deep.equal('Elements should always be provided');
      });

      it('should instanciate a Module, keep elements and components if present', function () {
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
              elements: [
                {
                  id: '84726001-1665-457d-8f13-4a74dc4768ea',
                  type: 'text',
                  content: '<h3>Content</h3>',
                },
              ],
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
          expect(grain.elements).not.to.be.empty;
          expect(grain.components).not.to.be.empty;
        }
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
              elements: [
                {
                  id: '84726001-1665-457d-8f13-4a74dc4768ea',
                  type: 'text',
                  content: '<h3>Content</h3>',
                },
              ],
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
              elements: [
                {
                  id: '84726001-1665-457d-8f13-4a74dc4768ea',
                  type: 'text',
                  content: '<h3>Content</h3>',
                },
                {
                  id: '16ad694a-848f-456d-95a6-c488350c3ed7',
                  type: 'unknown',
                  content: 'Should not be added to the grain',
                },
              ],
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
            elements: [
              {
                id: '123',
                instruction: 'instruction',
                locales: ['fr-FR'],
                proposals,
                feedbacks,
                type: 'qcu',
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
