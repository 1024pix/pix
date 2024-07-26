import * as usecase from '../../../../../src/shared/application/usecases/checkUserIsMemberOfCertificationCenter.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Use Case | CheckUserIsMemberOfCertificationCenter', function () {
  let certificationCenterMembershipRepositoryStub;

  beforeEach(function () {
    certificationCenterMembershipRepositoryStub = {
      isMemberOfCertificationCenter: sinon.stub(),
    };
  });

  context('When user is member in certification center', function () {
    it('should return true', async function () {
      // given
      const user = domainBuilder.buildUser();
      const certificationCenter = domainBuilder.buildCertificationCenter();

      domainBuilder.buildCertificationCenterMembership({ user, certificationCenter });
      certificationCenterMembershipRepositoryStub.isMemberOfCertificationCenter.resolves(true);

      // when
      const response = await usecase.execute(user.id, certificationCenter.id, {
        certificationCenterMembershipRepository: certificationCenterMembershipRepositoryStub,
      });

      // then
      expect(response).to.equal(true);
    });
  });

  context('When user is not admin in organization', function () {
    it('should return false', async function () {
      // given
      const userId = 1234;
      const certificationCenterId = 789;
      certificationCenterMembershipRepositoryStub.isMemberOfCertificationCenter.resolves(false);

      // when
      const response = await usecase.execute(userId, certificationCenterId, {
        certificationCenterMembershipRepository: certificationCenterMembershipRepositoryStub,
      });

      // then
      expect(response).to.equal(false);
    });
  });
});
