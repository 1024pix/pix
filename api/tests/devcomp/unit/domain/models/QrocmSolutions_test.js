import { ModuleInstantiationError } from '../../../../../src/devcomp/domain/errors.js';
import { QrocmSolutions } from '../../../../../src/devcomp/domain/models/QrocmSolutions.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | QrocmSolutions', function () {
  describe('#constructor', function () {
    it('should instanciate a QROCM For Verification with right attributes', function () {
      // given
      const givenProposals = [
        {
          type: 'text',
          content: '<p>Le symbole</p>',
        },
        {
          input: 'inputBlock',
          type: 'input',
          inputType: 'text',
          size: 1,
          display: 'inline',
          placeholder: '',
          ariaLabel: 'Réponse 1',
          defaultValue: '',
          tolerances: ['t1', 't2'],
          solutions: ['@'],
        },
        {
          input: 'selectBlock',
          type: 'select',
          display: 'inline',
          placeholder: '',
          ariaLabel: 'Réponse 3',
          defaultValue: '',
          tolerances: ['t2', 't3'],
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
          solutions: ['2'],
        },
      ];

      // when
      const solutions = new QrocmSolutions(givenProposals);

      // then
      expect(solutions.value).deep.equal({
        inputBlock: ['@'],
        selectBlock: ['2'],
      });
      expect(solutions.tolerances).deep.equal({
        inputBlock: ['t1', 't2'],
        selectBlock: ['t2', 't3'],
      });
    });

    describe('A QROCM solution with missing solutions into a proposal', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () =>
            new QrocmSolutions([
              {
                input: 'inputBlock',
                type: 'input',
                inputType: 'text',
                size: 1,
                display: 'inline',
                placeholder: '',
                ariaLabel: 'Réponse 1',
                defaultValue: '',
                tolerances: ['t1', 't2'],
              },
            ]),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The solutions are required for each QROCM proposal in QROCM solutions');
      });
    });

    describe('A QROCM solution with missing tolerances into a proposal', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () =>
            new QrocmSolutions([
              {
                input: 'inputBlock',
                type: 'input',
                inputType: 'text',
                size: 1,
                display: 'inline',
                placeholder: '',
                ariaLabel: 'Réponse 1',
                defaultValue: '',
                solutions: ['@'],
              },
            ]),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The tolerances are required for each QROCM proposal in QROCM solutions');
      });
    });

    describe('A QROCM solution with solutions which is not a list', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () =>
            new QrocmSolutions([
              {
                input: 'inputBlock',
                type: 'input',
                inputType: 'text',
                size: 1,
                display: 'inline',
                placeholder: '',
                ariaLabel: 'Réponse 1',
                defaultValue: '',
                tolerances: ['t1'],
                solutions: '@',
              },
            ]),
        )();

        // then
        expect(error).to.be.instanceOf(ModuleInstantiationError);
        expect(error.message).to.equal('Each proposal in QROCM solutions should have a list of solutions');
      });
    });

    describe('A QROCM solution with tolerances which is not a list', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () =>
            new QrocmSolutions([
              {
                input: 'inputBlock',
                type: 'input',
                inputType: 'text',
                size: 1,
                display: 'inline',
                placeholder: '',
                ariaLabel: 'Réponse 1',
                defaultValue: '',
                solutions: ['@'],
                tolerances: 't1',
              },
            ]),
        )();

        // then
        expect(error).to.be.instanceOf(ModuleInstantiationError);
        expect(error.message).to.equal('A QROCM solution should have a list of tolerances');
      });
    });
  });
});
