import { expect, sinon, domainBuilder } from '../../../test-helper';
import getCertificationPointOfContact from '../../../../lib/domain/usecases/get-certification-point-of-contact';

describe('Unit | UseCase | get-certification-point-of-contact', function () {
  const userId = 123;
  let certificationPointOfContactRepository;

  beforeEach(function () {
    certificationPointOfContactRepository = { get: sinon.stub() };
  });

  it('should return the CertificationPointOfContact', async function () {
    // given
    const expectedCertificationPointOfContact = domainBuilder.buildCertificationPointOfContact({ id: userId });
    certificationPointOfContactRepository.get.withArgs(userId).resolves(expectedCertificationPointOfContact);

    // when
    const actualCertificationPointOfContact = await getCertificationPointOfContact({
      userId,
      certificationPointOfContactRepository,
    });

    // then
    expect(actualCertificationPointOfContact).to.deep.equal(expectedCertificationPointOfContact);
  });
});
