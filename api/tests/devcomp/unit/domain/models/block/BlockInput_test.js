import { BlockInput } from '../../../../../../src/devcomp/domain/models/block/BlockInput.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Block | BlockInput', function () {
  describe('#constructor', function () {
    it('should create a input block and keep attributes', function () {
      // given
      const constructor = {
        input: 'symbole',
        inputType: 'text',
        size: 1,
        display: 'inline',
        placeholder: 'a placeholder',
        ariaLabel: 'Réponse 1',
        defaultValue: 'default',
        tolerances: ['t1'],
        solutions: ['@'],
      };

      // when
      const input = new BlockInput(constructor);

      // then
      expect(input.type).to.equal('input');
      expect(input.input).to.equal(constructor.input);
      expect(input.inputType).to.equal(constructor.inputType);
      expect(input.size).to.equal(constructor.size);
      expect(input.display).to.equal(constructor.display);
      expect(input.placeholder).to.equal(constructor.placeholder);
      expect(input.ariaLabel).to.equal(constructor.ariaLabel);
      expect(input.defaultValue).to.equal(constructor.defaultValue);
      expect(input.tolerances).to.equal(constructor.tolerances);
      expect(input.solutions).to.equal(constructor.solutions);
    });
  });

  describe('If input is missing', function () {
    it('should throw an error', function () {
      expect(() => new BlockInput({})).to.throw('The input is required for an input block');
    });
  });

  describe('If inputType is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            input: 'symbole',
          }),
      ).to.throw('The input type is required for an input block');
    });
  });

  describe('If size is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            input: 'symbole',
            inputType: 'text',
          }),
      ).to.throw('The size is required for an input block');
    });
  });

  describe('If display is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            input: 'symbole',
            inputType: 'text',
            size: 1,
          }),
      ).to.throw('The display is required for an input block');
    });
  });

  describe('If placeholder is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            input: 'symbole',
            inputType: 'text',
            size: 1,
            display: 'inline',
          }),
      ).to.throw('The placeholder is required for an input block');
    });
  });

  describe('If ariaLabel is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            input: 'symbole',
            inputType: 'text',
            size: 1,
            display: 'inline',
            placeholder: '',
          }),
      ).to.throw('The aria Label is required for an input block');
    });
  });

  describe('If defaultValue is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            input: 'symbole',
            inputType: 'text',
            size: 1,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 1',
          }),
      ).to.throw('The default value is required for an input block');
    });
  });

  describe('If tolerances are missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            input: 'symbole',
            inputType: 'text',
            size: 1,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            defaultValue: '',
          }),
      ).to.throw('The tolerances are required for an input block');
    });
  });

  describe('If solutions are missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            input: 'symbole',
            inputType: 'text',
            size: 1,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            defaultValue: '',
            tolerances: ['t1'],
          }),
      ).to.throw('The solutions are required for an input block');
    });
  });
});
