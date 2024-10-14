import { getAttestationsForOrganizationLearnersAndKey } from '../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Prescription | Learner-Management | Unit | Infrastructure | organization-learner-repository', function () {
  describe('#getAttestationsForOrganizationLearnersAndKey', function () {
    it('should call attestation api with attestationKey and userIds', async function () {
      //given
      const attestationApiStub = { generateAttestations: sinon.stub() };
      const attestationKey = Symbol('attestation');
      const userId1 = 1;
      const userId2 = 2;
      const organizationLearners = [{ userId: userId1 }, { userId: userId2 }];

      const expectedResult = Symbol('expectedResult');

      attestationApiStub.generateAttestations
        .withArgs({ attestationKey, userIds: [userId1, userId2] })
        .resolves(expectedResult);

      //when
      const result = await getAttestationsForOrganizationLearnersAndKey({
        attestationKey,
        organizationLearners,
        attestationsApi: attestationApiStub,
      });

      //then
      expect(result).to.be.equal(expectedResult);
    });
  });
});
