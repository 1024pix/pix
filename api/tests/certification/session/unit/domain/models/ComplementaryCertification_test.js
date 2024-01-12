import { expect, domainBuilder, catchErrSync } from '../../../../../test-helper.js';
import { ComplementaryCertification } from '../../../../../../src/certification/session/domain/models/ComplementaryCertification.js';

describe('Unit | Certification | Session | Domain | Models | ComplementaryCertification', function () {
  it('should return a complementary certification', function () {
    // given
    const complementaryCertification =
      domainBuilder.certification.session.buildCertificationSessionComplementaryCertification();

    // when / then
    expect(complementaryCertification).to.deepEqualInstance(new ComplementaryCertification(complementaryCertification));
  });

  context('should verify complementary certification key', function () {
    it('should return an error', function () {
      // given
      const notAKey = 'Not a valid key';

      // when
      const error = catchErrSync(
        domainBuilder.certification.session.buildCertificationSessionComplementaryCertification,
      )({ key: notAKey });

      // then
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal('Illegal argument provided');
    });
  });
});
