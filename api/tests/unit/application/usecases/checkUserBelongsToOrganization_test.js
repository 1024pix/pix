import { expect, sinon, domainBuilder } from '../../../test-helper';
import useCase from '../../../../lib/application/usecases/checkUserBelongsToOrganization';
import membershipRepository from '../../../../lib/infrastructure/repositories/membership-repository';

describe('Unit | Application | Use Case | checkUserBelongsToOrganization', function () {
  beforeEach(function () {
    membershipRepository.findByUserIdAndOrganizationId = sinon.stub();
  });

  context('When user is in the organization', function () {
    it('should return true', async function () {
      // given
      const userId = 1234;
      const organization = domainBuilder.buildOrganization();
      const membership = domainBuilder.buildMembership({ organization });
      membershipRepository.findByUserIdAndOrganizationId.resolves([membership]);

      // when
      const response = await useCase.execute(userId, organization.id);

      // then
      expect(response).to.equal(true);
    });

    it('should return true when there are several memberships', async function () {
      // given
      const userId = 1234;
      const organization = domainBuilder.buildOrganization();
      const membership1 = domainBuilder.buildMembership({ organization });
      const membership2 = domainBuilder.buildMembership({ organization });
      membershipRepository.findByUserIdAndOrganizationId.resolves([membership1, membership2]);

      // when
      const response = await useCase.execute(userId, organization.id);

      // then
      expect(response).to.equal(true);
    });
  });

  context('When user is not in the organization', function () {
    it('should return false', async function () {
      // given
      const userId = 1234;
      const organization = domainBuilder.buildOrganization();
      membershipRepository.findByUserIdAndOrganizationId.resolves([]);

      // when
      const response = await useCase.execute(userId, organization.id);

      // then
      expect(response).to.equal(false);
    });
  });
});
