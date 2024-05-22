import { ComplementaryCertification } from '../../../../../../src/certification/session-management/domain/models/ComplementaryCertification.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Session-Management | Domain | Models | ComplementaryCertification', function () {
  it('should return a complementary certification', function () {
    // given
    const complementaryCertification =
      domainBuilder.certification.sessionManagement.buildCertificationSessionComplementaryCertification();

    // when / then
    expect(complementaryCertification).to.deepEqualInstance(new ComplementaryCertification(complementaryCertification));
  });
});
