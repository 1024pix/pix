import { Center } from '../../../../../../src/certification/configuration/domain/models/Center.js';
import { CenterTypes } from '../../../../../../src/certification/configuration/domain/models/CenterTypes.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Configuration | Domain | Models | Center', function () {
  it('should build a Center', function () {
    // given
    // when
    const center = new Center({
      id: 12,
      type: CenterTypes.PRO,
      externalId: 'hello',
    });

    // then
    expect(center).to.deep.equal({
      id: 12,
      type: CenterTypes.PRO,
      externalId: 'hello',
    });
  });

  context('class invariants', function () {
    it('should not allow Center without type', function () {
      // given
      // when
      const error = catchErrSync(() => new Center({}))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });
  });
});
