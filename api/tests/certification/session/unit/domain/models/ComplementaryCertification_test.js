import { expect, domainBuilder } from '../../../../../test-helper.js';
import { ComplementaryCertification } from '../../../../../../src/certification/session/domain/models/ComplementaryCertification.js';

describe('Unit | Certification | Session | Domain | Models | ComplementaryCertification', function () {
  it('should return a complementary certification', function () {
    // given
    const complementaryCertification =
      domainBuilder.certification.session.buildCertificationSessionComplementaryCertification();

    // when / then
    expect(complementaryCertification).to.deepEqualInstance(new ComplementaryCertification(complementaryCertification));
  });
});
