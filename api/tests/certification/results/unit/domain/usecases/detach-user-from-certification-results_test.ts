import { expect } from 'chai';
import sinon from 'sinon';

import { detachUserFromCertificationResults } from '../../../../../../src/certification/results/domain/usecases/detach-user-from-certification-results.ts';

describe('Certification | Results | Unit | Domain | UseCases | detach-user-from-certification-results', function () {
  it('removes the link between the user and their certification results', async function () {
    // given
    const userId = 123;
    const newCertificationResultRepository = { detachUser: sinon.stub().resolves() };

    // when
    await detachUserFromCertificationResults({ userId, newCertificationResultRepository });

    // then
    expect(newCertificationResultRepository.detachUser).to.have.been.calledOnceWithExactly(userId);
  });
});
