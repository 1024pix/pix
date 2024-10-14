import { Buffer } from 'node:buffer';

import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Prescription | Learner Management | Domain | UseCase | get-attestation-zip-for-divisions', function () {
  it('returns a zip attestation', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    databaseBuilder.factory.buildOrganizationLearner({ organizationId, division: '6eme A' });
    databaseBuilder.factory.buildOrganizationLearner({ organizationId, division: '6eme B' });
    const attestation = databaseBuilder.factory.buildAttestation();

    await databaseBuilder.commit();

    // when
    const result = await usecases.getAttestationZipForDivisions({
      attestationKey: attestation.key,
      divisions: ['6eme A', '6eme B'],
      organizationId,
    });

    // then
    expect(Buffer.isBuffer(result)).to.be.true;
  });
});
