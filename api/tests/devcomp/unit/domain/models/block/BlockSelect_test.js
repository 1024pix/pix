import { BlockSelect } from '../../../../../../src/devcomp/domain/models/block/BlockSelect.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Block | BlockSelect', function () {
  describe('#constructor', function () {
    it('should create a select block and keep attributes', function () {
      // given
      const constructor = {
        input: 'symbole',
        display: 'inline',
        placeholder: 'a placeholder',
        ariaLabel: 'Réponse 1',
        defaultValue: 'default',
        tolerances: ['t1'],
        options: [Symbol('option')],
        solutions: ['@'],
      };

      // when
      const select = new BlockSelect(constructor);

      // then
      expect(select.type).to.equal('select');
      expect(select.input).to.equal(constructor.input);
      expect(select.display).to.equal(constructor.display);
      expect(select.placeholder).to.equal(constructor.placeholder);
      expect(select.ariaLabel).to.equal(constructor.ariaLabel);
      expect(select.defaultValue).to.equal(constructor.defaultValue);
      expect(select.tolerances).to.equal(constructor.tolerances);
      expect(select.options).to.equal(constructor.options);
      expect(select.solutions).to.equal(constructor.solutions);
    });
  });

  describe('If input is missing', function () {
    it('should throw an error', function () {
      expect(() => new BlockSelect({})).to.throw("L'input est obligatoire pour un bloc de selection");
    });
  });
  describe('If display is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockSelect({
            input: 'symbole',
          }),
      ).to.throw('Le display est obligatoire pour un bloc de selection');
    });
  });
  describe('If placeholder is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockSelect({
            input: 'symbole',
            display: 'inline',
          }),
      ).to.throw('Le placeholder est obligatoire pour un bloc de selection');
    });
  });
  describe('If ariaLabel is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockSelect({
            input: 'symbole',
            display: 'inline',
            placeholder: 'a placeholder',
          }),
      ).to.throw("L'aria Label est obligatoire pour un bloc de selection");
    });
  });
  describe('If defaultValue is missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockSelect({
            input: 'symbole',
            display: 'inline',
            placeholder: 'a placeholder',
            ariaLabel: 'Réponse 1',
          }),
      ).to.throw('La valeur par défaut est obligatoire pour un bloc de selection');
    });
  });
  describe('If tolerances are missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockSelect({
            input: 'symbole',
            display: 'inline',
            placeholder: 'a placeholder',
            ariaLabel: 'Réponse 1',
            defaultValue: 'default',
          }),
      ).to.throw('Les tolérances sont obligatoires pour un bloc de selection');
    });
  });
  describe('If options are missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockSelect({
            input: 'symbole',
            display: 'inline',
            placeholder: 'a placeholder',
            ariaLabel: 'Réponse 1',
            defaultValue: 'default',
            tolerances: ['t1'],
          }),
      ).to.throw('Les options sont obligatoires pour un bloc de selection');
    });
  });

  describe('If solutions are missing', function () {
    it('should throw an error', function () {
      expect(
        () =>
          new BlockSelect({
            input: 'symbole',
            display: 'inline',
            placeholder: 'a placeholder',
            ariaLabel: 'Réponse 1',
            defaultValue: 'default',
            tolerances: ['t1'],
            options: [Symbol('option')],
          }),
      ).to.throw('Les solutions sont obligatoires pour un bloc de selection');
    });
  });
});
