import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import * as usecase from '../../../../lib/application/usecases/checkUserIsAdminOfCertificationCenter.js';

describe('Unit | Application | Use Case | CheckUserIsAdminOfCertificationCenter', function () {
  let certificationCenter, certificationCenterMembershipRepositoryStub, user;

  beforeEach(function () {
    certificationCenter = domainBuilder.buildCertificationCenter();
    certificationCenterMembershipRepositoryStub = {
      isAdminOfCertificationCenter: sinon.stub(),
    };
    user = domainBuilder.buildUser();
  });

  context('When user is admin of the certification center', function () {
    it('returns true', async function () {
      // given
      certificationCenterMembershipRepositoryStub.isAdminOfCertificationCenter.resolves(true);

      // when
      const response = await usecase.execute(user.id, certificationCenter.id, {
        certificationCenterMembershipRepository: certificationCenterMembershipRepositoryStub,
      });

      // then
      expect(response).to.equal(true);
    });
  });

  context('When user is not admin of the certification center', function () {
    it('returns false', async function () {
      // given
      certificationCenterMembershipRepositoryStub.isAdminOfCertificationCenter.resolves(false);

      // when
      const response = await usecase.execute(user.id, certificationCenter.id, {
        certificationCenterMembershipRepository: certificationCenterMembershipRepositoryStub,
      });

      // then
      expect(response).to.equal(false);
    });
  });
});
