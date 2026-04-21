import sinon from 'sinon';

import { acceptPixOrgaTermsOfService } from '../../../../../src/identity-access-management/domain/usecases/accept-pix-orga-terms-of-service.usecase.js';

describe('Unit | Identity Access Management | Domain | UseCase | accept-pix-orga-terms-of-service', function () {
  let legalDocumentApiRepository;

  beforeEach(function () {
    legalDocumentApiRepository = { acceptPixOrgaTos: sinon.stub() };
  });

  it('accepts terms of service of pix-orga', async function () {
    // given
    const userId = Symbol('userId');
    legalDocumentApiRepository.acceptPixOrgaTos.resolves();

    // when
    await acceptPixOrgaTermsOfService({ userId, legalDocumentApiRepository });

    // then
    expect(legalDocumentApiRepository.acceptPixOrgaTos).to.have.been.calledWithExactly({ userId });
  });
});
