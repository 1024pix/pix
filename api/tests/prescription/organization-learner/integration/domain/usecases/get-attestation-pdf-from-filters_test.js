import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { mockAttestationStorage } from '../../../../../tooling/mocks/attestation-storage.mock.js';

describe('Integration | Prescription | Learner Management | Domain | UseCase | get-attestation-zip-for-divisions', function () {
  it('returns a pdf attestation', async function () {
    // given
    const templateName = 'sixth-grade-attestation-template';
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const firstLearner = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      division: '6eme A',
    });
    const secondLearner = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      division: '6eme B',
    });
    const attestation = databaseBuilder.factory.buildAttestation({ templateName });
    mockAttestationStorage(attestation);
    const firstRewardId = databaseBuilder.factory.buildProfileReward({
      rewardId: attestation.id,
      userId: firstLearner.userId,
    });
    databaseBuilder.factory.buildProfileReward({
      rewardId: attestation.id,
      userId: secondLearner.userId,
    });
    databaseBuilder.factory.buildOrganizationsProfileRewards({
      organizationId,
      profileRewardId: firstRewardId.id,
    });
    await databaseBuilder.commit();

    // when
    const result = await usecases.getAttestationPdfFromFilters({
      attestationKey: attestation.key,
      divisions: ['6eme A', '6eme B'],
      organizationId,
    });

    // then
    expect(Buffer.isBuffer(result)).to.be.true;
  });
});
