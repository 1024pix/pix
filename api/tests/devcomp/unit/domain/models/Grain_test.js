import { Grain } from '../../../../../src/devcomp/domain/models/Grain.js';
import { catchErrSync, expect } from '../../../../test-helper.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

describe('Unit | Devcomp | Domain | Models | Grain', function () {
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
        expect(() => new Grain({})).to.throw('The id is required for a grain');
      });
    });

    describe('if a grain does not have a title', function () {
      it('should throw an error', function () {
        expect(() => new Grain({ id: 1 })).to.throw('The title is required for a grain');
      });
    });

    describe('if a grain does not have an element', function () {
      describe('given no grain param', function () {
        it('should throw an error', function () {
          expect(() => new Grain({ id: 'id_grain_1', title: 'Bien écrire son adresse mail' })).to.throw(
            `A list of elements is required for a grain`,
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
          ).to.throw(`A grain should have a list of elements`);
        });
      });
    });
  });

  describe('#getElementById', function () {
    it('should return the element by Id if it exists', function () {
      // given
      const elementId = 'elementId';
      const expectedElement = { id: elementId };

      // when
      const grain = new Grain({ id: 1, title: '', elements: [expectedElement] });

      // then
      expect(grain.getElementById(elementId)).to.deep.equal(expectedElement);
    });

    it('should throw an error if element does not exist', function () {
      // given
      const elementId = 'elementId';
      const expectedElement = { id: elementId };

      const grain = new Grain({ id: 1, title: '', elements: [expectedElement] });

      // when
      const error = catchErrSync(grain.getElementById, grain)('another-element-id');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
