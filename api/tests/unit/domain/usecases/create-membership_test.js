import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper';
import createMembership from '../../../../lib/domain/usecases/create-membership';
import Membership from '../../../../lib/domain/models/Membership';
import { OrganizationArchivedError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | create-membership', function () {
  it('should insert a new membership with role ADMIN', async function () {
    // given
    const organization = domainBuilder.buildOrganization();
    const membershipRepository = {
      create: sinon.stub(),
      findByOrganizationId: sinon.stub().resolves([]),
    };
    const organizationRepository = {
      get: sinon.stub().resolves(organization),
    };
    const userId = 1;
    const role = Membership.roles.ADMIN;

    // when
    await createMembership({ userId, organizationId: organization.id, membershipRepository, organizationRepository });

    // then
    expect(membershipRepository.create).to.has.been.calledWithExactly(userId, organization.id, role);
  });

  it('should insert a new membership with role MEMBER', async function () {
    // given
    const organization = domainBuilder.buildOrganization();
    const membershipRepository = {
      create: sinon.stub(),
      findByOrganizationId: sinon.stub().resolves([{}]),
    };
    const organizationRepository = {
      get: sinon.stub().resolves(organization),
    };
    const userId = 1;
    const role = Membership.roles.MEMBER;

    // when
    await createMembership({ userId, organizationId: organization.id, membershipRepository, organizationRepository });

    // then
    expect(membershipRepository.create).to.has.been.calledWithExactly(userId, organization.id, role);
  });

  describe('when organization is archived', function () {
    it('should throw an organization archived error', async function () {
      // given
      const userId = domainBuilder.buildUser().id;
      const archivedOrganization = domainBuilder.buildOrganization({ archivedAt: '2022-02-02' });
      const membershipRepository = {
        create: sinon.stub(),
      };
      const organizationRepository = {
        get: sinon.stub().resolves(archivedOrganization),
      };

      // when
      const error = await catchErr(createMembership)({
        userId,
        organizationId: archivedOrganization.id,
        membershipRepository,
        organizationRepository,
      });

      // then
      expect(error).to.be.instanceOf(OrganizationArchivedError);
      expect(error.message).to.be.equal("L'organisation est archivée.");
      expect(membershipRepository.create).to.not.have.been.called;
    });
  });
});
