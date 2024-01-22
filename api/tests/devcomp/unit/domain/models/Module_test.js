import { Module } from '../../../../../src/devcomp/domain/models/Module.js';
import { catchErrSync, expect } from '../../../../test-helper.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

describe('Unit | Devcomp | Domain | Models | Module', function () {
  describe('#constructor', function () {
    it('should create a module and keep attributes', function () {
      // given
      const id = 1;
      const slug = 'les-adresses-email';
      const title = 'Les adresses email';
      const grains = [Symbol('text')];
      const transitionTexts = [];

      // when
      const module = new Module({ id, slug, title, grains, transitionTexts });

      // then
      expect(module.id).to.equal(id);
      expect(module.slug).to.equal(slug);
      expect(module.title).to.equal(title);
      expect(module.transitionTexts).to.equal(transitionTexts);
      expect(module.grains).to.have.length(grains.length);
    });

    describe('if a module does not have an id', function () {
      it('should throw an error', function () {
        expect(() => new Module({})).to.throw("L'id est obligatoire pour un module");
      });
    });

    describe('if a module does not have a title', function () {
      it('should throw an error', function () {
        expect(() => new Module({ id: 1 })).to.throw('Le titre est obligatoire pour un module');
      });
    });

    describe('if a module does not have a slug', function () {
      it('should throw an error', function () {
        expect(() => new Module({ id: 1, title: '' })).to.throw('Le slug est obligatoire pour un module');
      });
    });

    describe('if a module does not have an element', function () {
      describe('given no grain param', function () {
        it('should throw an error', function () {
          expect(
            () =>
              new Module({
                id: 'id_module_1',
                slug: 'bien-ecrire-son-adresse-mail',
                title: 'Bien écrire son adresse mail',
              }),
          ).to.throw('Une liste de grains est obligatoire pour un module');
        });
      });

      describe('given a wrong typed grain in param', function () {
        it('should throw an error', function () {
          expect(
            () =>
              new Module({
                id: 'id_module_1',
                slug: 'bien-ecrire-son-adresse-mail',
                title: 'Bien écrire son adresse mail',
                grains: 'elements',
              }),
          ).to.throw(`Un Module doit forcément posséder une liste de grains`);
        });
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

        // when
        const foundGrain = new Module({ id, slug, title, grains: [expectedGrain] }).getGrainByElementId(elementId);

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
        const module = new Module({ id, slug, title, grains: [grain] });

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
});
