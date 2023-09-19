import { Module } from '../../../../../src/devcomp/domain/models/Module.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Models | Module', function () {
  describe('#constructor', function () {
    describe('if a module does not have an id', function () {
      it('should throw an error', function () {
        expect(() => new Module({})).to.throw("L'id est obligatoire pour un module");
      });
    });

    describe('if a module does not have a description', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should throw an error', function () {});
    });

    describe('if a module does not have a grain', function () {
      describe('given no grains param', function () {
        it('should throw an error', function () {
          expect(() => new Module({ id: 'id_module_1' })).to.throw(
            'Un module doit forcément avoir au moins deux grains',
          );
        });
      });

      describe('given one grains', function () {
        it('should throw an error', function () {
          expect(() => new Module({ id: 'id_module_1', grains: ['grain1'] })).to.throw(
            'Un module doit forcément avoir au moins deux grains',
          );
        });
      });

      describe('given a wrong typed grains param', function () {
        it('should throw an error', function () {
          expect(() => new Module({ id: 'id_module_1', grains: 'liste' })).to.throw(
            'Un module doit forcément avoir au moins deux grains',
          );
        });
      });

      describe('given an empty list of grains', function () {
        it('should throw an error', function () {
          expect(() => new Module({ id: 'id_module_1', grains: [] })).to.throw(
            'Un module doit forcément avoir au moins deux grains',
          );
        });
      });

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

        describe('given a module with two grains which are the same', function () {
          // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
          // eslint-disable-next-line no-empty-function
          it('should throw an error', function () {});
        });
      });
    });
  });
});
