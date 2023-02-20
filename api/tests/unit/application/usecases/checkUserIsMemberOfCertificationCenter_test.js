import { expect, sinon, domainBuilder } from '../../../test-helper';
import usecase from '../../../../lib/application/usecases/checkUserIsMemberOfCertificationCenter';
import certificationCenterMembershipRepository from '../../../../lib/infrastructure/repositories/certification-center-membership-repository';

describe('Unit | Application | Use Case | CheckUserIsMemberOfCertificationCenter', function () {
  beforeEach(function () {
    certificationCenterMembershipRepository.isMemberOfCertificationCenter = sinon.stub();
  });

  context('When user is member in certification center', function () {
    it('should return true', async function () {
      // given
      const user = domainBuilder.buildUser();
      const certificationCenter = domainBuilder.buildCertificationCenter();

      domainBuilder.buildCertificationCenterMembership({ user, certificationCenter });
      certificationCenterMembershipRepository.isMemberOfCertificationCenter.resolves(true);

      // when
      const response = await usecase.execute(user.id, certificationCenter.id);

      // then
      expect(response).to.equal(true);
    });
  });

  context('When user is not admin in organization', function () {
    it('should return false', async function () {
      // given
      const userId = 1234;
      const certificationCenterId = 789;
      certificationCenterMembershipRepository.isMemberOfCertificationCenter.resolves(false);

      // when
      const response = await usecase.execute(userId, certificationCenterId);

      // then
      expect(response).to.equal(false);
    });
  });
});
