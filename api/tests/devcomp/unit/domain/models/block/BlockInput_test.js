import { BlockInput } from '../../../../../../src/devcomp/domain/models/block/BlockInput.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Block | BlockInput', function () {
  describe('#constructor', function () {
    it('should create a input block and keep attributes', function () {
      // given
      const constructor = {
        type: 'input',
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
      expect(input.type).to.equal(constructor.type);
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

  describe('If type is missing', function () {
    it('should throw an error', function () {
      expect(() => new BlockInput({})).to.throw("Le type est obligatoire pour un bloc d'input");
    });
  });

  describe('If input is missing', function () {
    it('should throw an error', function () {
      expect(() => new BlockInput({ type: 'input' })).to.throw("L'input est obligatoire pour un bloc d'input");
    });
  });

  describe('If inputType is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            type: 'input',
            input: 'symbole',
          }),
      ).to.throw("Le type d'input est obligatoire pour un bloc d'input");
    });
  });
  describe('If size is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            type: 'input',
            input: 'symbole',
            inputType: 'text',
          }),
      ).to.throw("La taille est obligatoire pour un bloc d'input");
    });
  });
  describe('If display is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            type: 'input',
            input: 'symbole',
            inputType: 'text',
            size: 1,
          }),
      ).to.throw("Le display est obligatoire pour un bloc d'input");
    });
  });
  describe('If placeholder is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            type: 'input',
            input: 'symbole',
            inputType: 'text',
            size: 1,
            display: 'inline',
          }),
      ).to.throw("Le placeholder est obligatoire pour un bloc d'input");
    });
  });
  describe('If ariaLabel is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            type: 'input',
            input: 'symbole',
            inputType: 'text',
            size: 1,
            display: 'inline',
            placeholder: '',
          }),
      ).to.throw("L'aria Label est obligatoire pour un bloc d'input");
    });
  });
  describe('If defaultValue is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            type: 'input',
            input: 'symbole',
            inputType: 'text',
            size: 1,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 1',
          }),
      ).to.throw("La valeur par défaut est obligatoire pour un bloc d'input");
    });
  });
  describe('If tolerances are missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            type: 'input',
            input: 'symbole',
            inputType: 'text',
            size: 1,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            defaultValue: '',
          }),
      ).to.throw("Les tolérances sont obligatoires pour un bloc d'input");
    });
  });

  describe('If solutions are missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockInput({
            type: 'input',
            input: 'symbole',
            inputType: 'text',
            size: 1,
            display: 'inline',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            defaultValue: '',
            tolerances: ['t1'],
          }),
      ).to.throw("Les solutions sont obligatoires pour un bloc d'input");
    });
  });
});
