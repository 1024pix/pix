import { expect } from 'chai';

import { OrganizationBatchCreationError } from '../../../../src/organizational-entities/domain/errors.js';

describe('Unit | Organizational Entities | Domain | Errors', function () {
  context('OrganizationBatchCreationError', function () {
    context('#fromJoiErrors', function () {
      it('should populate error meta with invalid attributes and current line', function () {
        // given
        const joiErrors = [
          {
            context: {
              key: 'organizationLearnerTypeId',
            },
            message: 'MISSING_VALUE',
          },

          {
            context: {
              key: 'categoryId',
            },
            message: 'NOT_A_NUMBER_VALUE',
          },
        ];

        const currentLine = 42;

        // when
        const error = OrganizationBatchCreationError.fromJoiErrors(joiErrors, currentLine);

        // then
        expect(error.code).to.equal('VALIDATION_ERROR');
        expect(error.meta).to.deep.equal({
          invalidAttributes: [
            { attribute: 'organizationLearnerTypeId', message: 'MISSING_VALUE' },
            { attribute: 'categoryId', message: 'NOT_A_NUMBER_VALUE' },
          ],
          currentLine,
        });
      });
    });
  });
});
