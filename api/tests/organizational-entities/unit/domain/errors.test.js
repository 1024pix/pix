import { expect } from 'chai';

import { OrganizationBatchCreationError } from '../../../../src/organizational-entities/domain/errors.js';
import { VALIDATION_ERRORS } from '../../../../src/shared/constants.js';

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
            message: VALIDATION_ERRORS.FIELD_REQUIRED,
          },

          {
            context: {
              key: 'categoryId',
            },
            message: VALIDATION_ERRORS.FIELD_NOT_A_NUMBER,
          },
        ];

        const currentLine = 42;

        // when
        const error = OrganizationBatchCreationError.fromJoiErrors(joiErrors, currentLine);

        // then
        expect(error.code).to.equal('VALIDATION_ERROR');
        expect(error.meta).to.deep.equal({
          invalidAttributes: [
            { attribute: 'organizationLearnerTypeId', message: VALIDATION_ERRORS.FIELD_REQUIRED },
            { attribute: 'categoryId', message: VALIDATION_ERRORS.FIELD_NOT_A_NUMBER },
          ],
          currentLine,
        });
      });
    });
  });
});
