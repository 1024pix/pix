import { ConvertCenterToV3Job } from '../../../../../../src/certification/configuration/domain/models/ConvertCenterToV3Job.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Configuration | Domain | Models | ConvertCenterToV3Job', function () {
  it('should create a ConvertCenterToV3Job object', function () {
    // given
    // when
    const error = catchErrSync(() => new ConvertCenterToV3Job({ centerId: null }))();
    // then
    expect(error).to.be.instanceOf(Error);
    expect(error.message).to.equal('centerId is required');
  });

  context('invariants', function () {
    it('should return an error if not center identifier given', function () {
      // given
      // when
      const result = new ConvertCenterToV3Job({ centerId: 12 });
      // then
      expect(result).to.deep.equal({ centerId: 12 });
    });
  });
});
