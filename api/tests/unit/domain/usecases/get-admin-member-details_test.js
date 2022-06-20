const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const getAdminMemberDetails = require('../../../../lib/domain/usecases/get-admin-member-details');

describe('Unit | UseCase | get-admin-member-details', function () {
  context('when it exists', function () {
    it('should return an admin member details', async function () {
      // given
      const adminMemberRepository = {
        get: sinon.stub(),
      };
      const adminMember = domainBuilder.buildAdminMember();
      adminMemberRepository.get.withArgs({ userId: adminMember.id }).resolves(adminMember);

      // when
      const adminMemberDetails = await getAdminMemberDetails({ adminMemberRepository, userId: adminMember.id });

      // then
      expect(adminMemberDetails).to.deep.equal(adminMember);
    });
  });

  context('when it does not exist', function () {
    it('should thrown a NotFound error', async function () {
      // given
      const adminMemberRepository = {
        get: sinon.stub(),
      };
      const adminMember = domainBuilder.buildAdminMember();
      adminMemberRepository.get.withArgs({ userId: adminMember.id }).resolves(undefined);

      // when
      const error = await catchErr(getAdminMemberDetails)({ adminMemberRepository, userId: adminMember.id });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
