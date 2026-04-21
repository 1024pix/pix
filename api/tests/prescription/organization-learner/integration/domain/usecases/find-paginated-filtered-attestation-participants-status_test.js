import { AttestationParticipantStatus } from '../../../../../../src/prescription/organization-learner/domain/read-models/AttestationParticipantStatus.js';
import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';
import { mockAttestationStorage } from '../../../../../tooling/mocks/attestation-storage.mock.js';

describe('Integration | Prescription | Learner Management | Domain | UseCase | find-paginated-filtered-attestation-participant-status', function () {
  let attestation, organizationId, firstLearner, secondLearner;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    firstLearner = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      firstName: 'Jean',
      division: '6eme A',
    });
    secondLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId, division: '6eme B' });
    attestation = databaseBuilder.factory.buildAttestation();
    mockAttestationStorage(attestation);
    const firstRewardId = databaseBuilder.factory.buildProfileReward({
      rewardId: attestation.id,
      userId: firstLearner.userId,
    });
    databaseBuilder.factory.buildProfileReward({ rewardId: attestation.id, userId: secondLearner.userId });
    databaseBuilder.factory.buildOrganizationsProfileRewards({ organizationId, profileRewardId: firstRewardId.id });
    await databaseBuilder.commit();
  });

  it('returns attestation participant status', async function () {
    // when
    const { attestationParticipantsStatus: result } = await usecases.findPaginatedFilteredAttestationParticipantsStatus(
      {
        attestationKey: attestation.key,
        organizationId,
        filter: {},
      },
    );

    // then
    expect(result).to.have.lengthOf(2);
    expect(result[0]).to.be.instanceOf(AttestationParticipantStatus);
  });

  context('when filter are provided', function () {
    it('should filter by divisions when there are present', async function () {
      // when
      const { attestationParticipantsStatus: result } =
        await usecases.findPaginatedFilteredAttestationParticipantsStatus({
          attestationKey: attestation.key,
          organizationId,
          filter: { divisions: ['6eme A'] },
        });

      // then
      expect(result).to.have.lengthOf(1);
      expect(result[0].organizationLearnerId).to.be.equal(firstLearner.id);
    });

    it('should filter by search', async function () {
      // when
      const { attestationParticipantsStatus: result } =
        await usecases.findPaginatedFilteredAttestationParticipantsStatus({
          attestationKey: attestation.key,
          organizationId,
          filter: { search: 'Jean' },
        });

      // then
      expect(result).to.have.lengthOf(1);
      expect(result[0].organizationLearnerId).to.be.equal(firstLearner.id);
    });

    context('when statuses filter are present', function () {
      context('when OBTAINED is present', function () {
        it('should only return attestation participant status with obtainedAt', async function () {
          // given & when
          const { attestationParticipantsStatus: result } =
            await usecases.findPaginatedFilteredAttestationParticipantsStatus({
              attestationKey: attestation.key,
              organizationId,
              filter: { statuses: ['OBTAINED'] },
            });

          // then
          expect(result).to.have.lengthOf(1);
          expect(result[0].organizationLearnerId).to.be.equal(firstLearner.id);
        });
      });

      context('when NOT_OBTAINED is present', function () {
        it('should return attestation participants status with obtainedAt at null', async function () {
          // given & when
          const { attestationParticipantsStatus: result } =
            await usecases.findPaginatedFilteredAttestationParticipantsStatus({
              attestationKey: attestation.key,
              organizationId,
              filter: { statuses: ['NOT_OBTAINED'] },
            });

          // then
          expect(result).to.have.lengthOf(1);
          expect(result[0].obtainedAt).to.be.null;
          expect(result[0].organizationLearnerId).to.equal(secondLearner.id);
        });
      });

      context('when both are present', function () {
        it('should return all attestation participants status', async function () {
          // given & when
          const { attestationParticipantsStatus: result } =
            await usecases.findPaginatedFilteredAttestationParticipantsStatus({
              attestationKey: attestation.key,
              organizationId,
              filter: { statuses: ['NOT_OBTAINED', 'OBTAINED'] },
            });

          // then
          expect(result).to.have.lengthOf(2);
        });
      });
    });

    context('when unknow filter is provided', function () {
      it('should not used it', async function () {
        // when
        const { attestationParticipantsStatus: result } =
          await usecases.findPaginatedFilteredAttestationParticipantsStatus({
            attestationKey: attestation.key,
            organizationId,
            filter: { unknown: 'test' },
          });

        // then
        expect(result).to.have.lengthOf(2);
      });
    });
  });
});
