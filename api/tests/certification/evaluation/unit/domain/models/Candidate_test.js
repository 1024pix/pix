import { Candidate } from '../../../../../../src/certification/evaluation/domain/models/Candidate.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Certification | Evaluation | Unit | Domain | Models | Candidate', function () {
  it('should build an evaluated candidate', function () {
    // given
    // when
    const candidate = new Candidate({ accessibilityAdjustmentNeeded: true, reconciledAt: new Date('2024-10-18') });

    // then
    expect(candidate).to.deep.equal({
      accessibilityAdjustmentNeeded: true,
      reconciledAt: new Date('2024-10-18'),
    });
  });

  context('invariants', function () {
    it('should assess that evaluated candidate is always reconciled', function () {
      // given
      const reconciledAt = null;

      // when
      const error = catchErrSync(
        (reconciledAt) => new Candidate({ accessibilityAdjustmentNeeded: false, reconciledAt }),
      )(reconciledAt);

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes).to.deep.equal([
        {
          attribute: 'reconciledAt',
          message: '"reconciledAt" must be a valid date',
        },
      ]);
    });
  });
});
