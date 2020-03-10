const { expect, sinon, domainBuilder } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkUserBelongsToOrganization');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');

describe('Unit | Application | Use Case | checkUserBelongsToOrganization', () => {

  beforeEach(() => {
    membershipRepository.findByUserIdAndOrganizationId = sinon.stub();
  });

  context('When user is in the organization', () => {

    it('should return true', async () => {
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

    it('should return true when there are several memberships', async () => {
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

  context('When user is not in the organization', () => {

    it('should return false', async () => {
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
