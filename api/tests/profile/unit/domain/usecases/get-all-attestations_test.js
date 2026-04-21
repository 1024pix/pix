import sinon from 'sinon';

import { getAllAttestations } from '../../../../../src/profile/domain/usecases/get-all-attestations.js';

describe('Profile | Unit | Domain | Usecases | get-all-attestations', function () {
  it('should return all attestations from repository', async function () {
    // given
    const attestations = Symbol('attestations');
    const attestationRepository = { findAll: sinon.stub().resolves(attestations) };

    // when
    const result = await getAllAttestations({ attestationRepository });

    // then
    expect(result).to.equal(attestations);
  });
});
