import { ComplementaryCertification } from '../../../../../../src/certification/session/domain/models/ComplementaryCertification.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Session | Domain | Models | ComplementaryCertification', function () {
  it('should return a complementary certification', function () {
    // given
    const complementaryCertification =
      domainBuilder.certification.session.buildCertificationSessionComplementaryCertification();

    // when / then
    expect(complementaryCertification).to.deepEqualInstance(new ComplementaryCertification(complementaryCertification));
  });
});
