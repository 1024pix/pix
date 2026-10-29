import { expect } from 'chai';
import sinon from 'sinon';

import { getCertificatesForSession } from '../../../../../../src/certification/results/domain/usecases/get-certificates-for-session.js';

describe('Unit | UseCase | get-certificates-for-session', function () {
  it('should return certificates pdf from session', async function () {
    // given
    const expectedResponse = Symbol('promise');
    const getCertificatesForSessionStub = sinon.stub().resolves(expectedResponse);
    const i18n = Symbol('i18n');

    // when
    const usecaseResponse = await getCertificatesForSession({
      sessionId: 11,
      isFrenchDomainExtension: true,
      i18n,
      dependencies: {
        getCertificatesForSession: getCertificatesForSessionStub,
      },
    });

    // then
    expect(getCertificatesForSessionStub).to.be.calledOnceWith({
      sessionId: 11,
      isFrenchDomainExtension: true,
      i18n,
    });

    expect(usecaseResponse).to.equal(expectedResponse);
  });
});
