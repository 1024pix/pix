import sinon from 'sinon';

import { getJuryCertification } from '../../../../../../src/certification/session-management/domain/usecases/get-jury-certification.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session-management | Unit | Domain | Usecases | get-jury-certification', function () {
  it('should return the jury certification', async function () {
    // given
    const expectedJuryCertification = domainBuilder.certification.sessionManagement.buildJuryCertification({
      certificationCourseId: 777,
    });
    const juryCertificationRepository = { get: sinon.stub() };
    juryCertificationRepository.get.withArgs({ certificationCourseId: 123 }).resolves(expectedJuryCertification);

    // when
    const juryCertification = await getJuryCertification({
      certificationCourseId: 123,
      juryCertificationRepository,
    });

    // then
    expect(juryCertification).to.deepEqualInstance(expectedJuryCertification);
  });
});
