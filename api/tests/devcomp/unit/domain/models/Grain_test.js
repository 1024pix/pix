import { Grain } from '../../../../../src/devcomp/domain/models/Grain.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Models | Grain', function () {
  describe('#constructor', function () {
    it('should create a grain and keep attributes', function () {
      // given
      const id = 1;
      const title = 'Les adresses email';
      const elements = [Symbol('text')];

      // when
      const grain = new Grain({ id, title, elements });

      // then
      expect(grain.id).to.equal(id);
      expect(grain.title).to.equal(title);
      expect(grain.elements).to.have.length(elements.length);
    });

    describe('if a grain does not have an id', function () {
      it('should throw an error', function () {
        expect(() => new Grain({})).to.throw("L'id est obligatoire pour un grain");
      });
    });

    describe('if a grain does not have a title', function () {
      it('should throw an error', function () {
        expect(() => new Grain({ id: 1 })).to.throw('Le titre est obligatoire pour un grain');
      });
    });

    describe('if a grain does not have an element', function () {
      describe('given no grain param', function () {
        it('should throw an error', function () {
          expect(() => new Grain({ id: 'id_grain_1', title: 'Bien écrire son adresse mail' })).to.throw(
            `Une liste d'éléments est obligatoire pour un grain`,
          );
        });
      });

      describe('given a wrong typed grain in param', function () {
        it('should throw an error', function () {
          expect(
            () =>
              new Grain({
                id: 'id_grain_1',
                title: 'Bien écrire son adresse mail',
                elements: 'elements',
              }),
          ).to.throw(`Un Grain doit forcément posséder une liste d'éléments`);
        });
      });
    });
  });
});
