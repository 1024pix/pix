import { ComplementaryCertification } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertification.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Enrolment | Domain | Models | ComplementaryCertification', function () {
  it('should return a complementary certification', function () {
    // given
    const complementaryCertification =
      domainBuilder.certification.sessionManagement.buildCertificationSessionComplementaryCertification();

    // when / then
    expect(complementaryCertification).to.deepEqualInstance(new ComplementaryCertification(complementaryCertification));
  });
});
