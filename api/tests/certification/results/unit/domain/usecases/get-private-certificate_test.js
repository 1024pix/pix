import sinon from 'sinon';

import { getPrivateCertificate } from '../../../../../../src/certification/results/domain/usecases/get-private-certificate.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Results | Unit | Domain | UseCases | getPrivateCertificate', function () {
  it('should get the private certificate', async function () {
    // given
    const certificateRepository = {
      getPrivateCertificate: sinon.stub(),
    };
    const privateCertificate = domainBuilder.buildPrivateCertificate({
      id: 123,
      userId: 456,
    });
    const locale = 'fr';
    certificateRepository.getPrivateCertificate.withArgs(123, { locale }).resolves(privateCertificate);

    // when
    const actualPrivateCertificate = await getPrivateCertificate({
      certificationCourseId: 123,
      userId: 456,
      locale,
      certificateRepository,
    });

    // then
    const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate({
      id: 123,
      userId: 456,
    });
    expect(actualPrivateCertificate).to.deep.equal(expectedPrivateCertificate);
  });
});
