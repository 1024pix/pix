import { expect } from 'chai';

import { QrocmSolutions } from '../../../../../src/devcomp/domain/models/QrocmSolutions.js';

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
  });
});
