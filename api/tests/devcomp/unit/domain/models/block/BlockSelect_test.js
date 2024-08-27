import { BlockSelect } from '../../../../../../src/devcomp/domain/models/block/BlockSelect.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

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
      // when
      const error = catchErrSync(() => new BlockSelect({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The input is required for a select block');
    });
  });

  describe('If display is missing', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new BlockSelect({ input: 'symbole' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The display is required for a select block');
    });
  });

  describe('If placeholder is missing', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new BlockSelect({ input: 'symbole', display: 'inline' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The placeholder is required for a select block');
    });
  });

  describe('If ariaLabel is missing', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () => new BlockSelect({ input: 'symbole', display: 'inline', placeholder: 'a placeholder' }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The aria Label is required for a select block');
    });
  });

  describe('If defaultValue is missing', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new BlockSelect({
            input: 'symbole',
            display: 'inline',
            placeholder: 'a placeholder',
            ariaLabel: 'Réponse 1',
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The default value is required for a select block');
    });
  });

  describe('If tolerances are missing', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new BlockSelect({
            input: 'symbole',
            display: 'inline',
            placeholder: 'a placeholder',
            ariaLabel: 'Réponse 1',
            defaultValue: 'default',
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The tolerances are required for a select block');
    });
  });

  describe('If options are missing', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new BlockSelect({
            input: 'symbole',
            display: 'inline',
            placeholder: 'a placeholder',
            ariaLabel: 'Réponse 1',
            defaultValue: 'default',
            tolerances: ['t1'],
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The options are required for a select block');
    });
  });

  describe('If solutions are missing', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
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
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The solutions are required for a select block');
    });
  });
});
