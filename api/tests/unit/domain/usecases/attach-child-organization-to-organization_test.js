import { UnableToAttachChildOrganizationToParentOrganizationError } from '../../../../lib/domain/errors.js';
import { attachChildOrganizationToOrganization } from '../../../../lib/domain/usecases/attach-child-organization-to-organization.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | Domain | UseCases | attach-child-organization-to-organization', function () {
  let organizationForAdminRepository;

  beforeEach(function () {
    organizationForAdminRepository = {
      findChildrenByParentOrganizationId: sinon.stub(),
      get: sinon.stub(),
      update: sinon.stub(),
    };
  });

  context('error cases', function () {
    context('when attaching child organization to itself', function () {
      it('throws an UnableToAttachChildOrganizationToParentOrganization error', async function () {
        // given
        const childOrganizationId = 1;
        const parentOrganizationId = 1;

        // when
        const error = await catchErr(attachChildOrganizationToOrganization)({
          childOrganizationId,
          parentOrganizationId,
          organizationForAdminRepository,
        });

        // then
        expect(error).to.be.instanceOf(UnableToAttachChildOrganizationToParentOrganizationError);
        expect(error.message).to.equal('Unable to attach child organization to itself');
        expect(error.code).to.equal('UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_ITSELF');
        expect(error.meta).to.deep.equal({ childOrganizationId, parentOrganizationId });
      });
    });

    context('when attaching an already attached child organization', function () {
      it('throws an UnableToAttachChildOrganizationToParentOrganization error', async function () {
        // given
        const childOrganization = domainBuilder.buildOrganizationForAdmin({
          id: 123,
          name: 'Child Organization',
          parentOrganizationId: 321,
        });
        const childOrganizationId = childOrganization.id;
        const parentOrganizationId = 1;

        organizationForAdminRepository.get.resolves(childOrganization);
        organizationForAdminRepository.findChildrenByParentOrganizationId.resolves([]);

        // when
        const error = await catchErr(attachChildOrganizationToOrganization)({
          childOrganizationId,
          parentOrganizationId,
          organizationForAdminRepository,
        });

        // then
        expect(organizationForAdminRepository.get).to.have.been.calledOnceWithExactly(childOrganization.id);
        expect(organizationForAdminRepository.update).to.not.have.been.called;
        expect(error).to.be.instanceOf(UnableToAttachChildOrganizationToParentOrganizationError);
        expect(error.message).to.equal('Unable to attach already attached child organization');
        expect(error.code).to.equal('UNABLE_TO_ATTACH_ALREADY_ATTACHED_CHILD_ORGANIZATION');
        expect(error.meta).to.deep.equal({ childOrganizationId });
      });
    });

    context('when parent organization is already child of an organization', function () {
      it('throws an UnableToAttachChildOrganizationToParentOrganization error', async function () {
        // given
        const childOrganization = domainBuilder.buildOrganizationForAdmin({
          id: 123,
          name: 'Child SCO Organization',
          type: 'PRO',
        });
        const grandParentOrganizationId = 23;
        const parentOrganization = domainBuilder.buildOrganizationForAdmin({
          id: 1,
          name: 'Parent PRO Organization',
          type: 'PRO',
          parentOrganizationId: grandParentOrganizationId,
        });
        const childOrganizationId = childOrganization.id;
        const parentOrganizationId = parentOrganization.id;

        organizationForAdminRepository.get.onCall(0).resolves(childOrganization);
        organizationForAdminRepository.get.onCall(1).resolves(parentOrganization);
        organizationForAdminRepository.findChildrenByParentOrganizationId.resolves([]);

        // when
        const error = await catchErr(attachChildOrganizationToOrganization)({
          childOrganizationId,
          parentOrganizationId,
          organizationForAdminRepository,
        });

        // then
        expect(organizationForAdminRepository.get).to.have.been.calledTwice;
        expect(organizationForAdminRepository.update).to.not.have.been.called;
        expect(error).to.be.instanceOf(UnableToAttachChildOrganizationToParentOrganizationError);
        expect(error.message).to.equal(
          'Unable to attach child organization to parent organization which is also a child organization',
        );
        expect(error.code).to.equal('UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_ANOTHER_CHILD_ORGANIZATION');
        expect(error.meta).to.deep.equal({
          grandParentOrganizationId,
          parentOrganizationId,
        });
      });
    });

    context('when attaching child organization without the same type as parent organization', function () {
      it('throws an UnableToAttachChildOrganizationToParentOrganization error', async function () {
        // given
        const childOrganization = domainBuilder.buildOrganizationForAdmin({
          id: 123,
          name: 'Child SCO Organization',
          type: 'SCO',
        });
        const parentOrganization = domainBuilder.buildOrganizationForAdmin({
          id: 1,
          name: 'Parent PRO Organization',
          type: 'PRO',
        });
        const childOrganizationId = childOrganization.id;
        const childOrganizationType = childOrganization.type;
        const parentOrganizationId = parentOrganization.id;
        const parentOrganizationType = parentOrganization.type;

        organizationForAdminRepository.get.onCall(0).resolves(childOrganization);
        organizationForAdminRepository.get.onCall(1).resolves(parentOrganization);
        organizationForAdminRepository.findChildrenByParentOrganizationId.resolves([]);

        // when
        const error = await catchErr(attachChildOrganizationToOrganization)({
          childOrganizationId,
          parentOrganizationId,
          organizationForAdminRepository,
        });

        // then
        expect(organizationForAdminRepository.get).to.have.been.calledTwice;
        expect(organizationForAdminRepository.update).to.not.have.been.called;
        expect(error).to.be.instanceOf(UnableToAttachChildOrganizationToParentOrganizationError);
        expect(error.message).to.equal(
          'Unable to attach child organization with a different type as the parent organization',
        );
        expect(error.code).to.equal('UNABLE_TO_ATTACH_CHILD_ORGANIZATION_WITHOUT_SAME_TYPE');
        expect(error.meta).to.deep.equal({
          childOrganizationId,
          childOrganizationType,
          parentOrganizationId,
          parentOrganizationType,
        });
      });
    });

    context('when the child organization is already parent', function () {
      it('throws an UnableToAttachChildOrganizationToParentOrganization error', async function () {
        // given
        const childOrganization = domainBuilder.buildOrganizationForAdmin({
          id: 123,
          name: 'Child SCO Organization',
          type: 'SCO',
        });
        const parentOrganization = domainBuilder.buildOrganizationForAdmin({
          id: 1,
          name: 'Parent PRO Organization',
          type: 'PRO',
        });
        const childOfParentOrganization = domainBuilder.buildOrganizationForAdmin({
          id: 456,
          name: 'Child of Parent PRO Organization',
          type: 'PRO',
        });
        const childOrganizationId = childOrganization.id;
        const parentOrganizationId = parentOrganization.id;

        organizationForAdminRepository.get.resolves(childOrganization);
        organizationForAdminRepository.findChildrenByParentOrganizationId.resolves([childOfParentOrganization]);

        // when
        const error = await catchErr(attachChildOrganizationToOrganization)({
          childOrganizationId,
          parentOrganizationId,
          organizationForAdminRepository,
        });

        // then
        expect(organizationForAdminRepository.findChildrenByParentOrganizationId).to.have.been.calledOnceWithExactly(
          childOrganizationId,
        );
        expect(organizationForAdminRepository.get).to.not.have.been.called;
        expect(organizationForAdminRepository.update).to.not.have.been.called;
        expect(error).to.be.instanceOf(UnableToAttachChildOrganizationToParentOrganizationError);
        expect(error.message).to.equal(
          'Unable to attach child organization because it is already parent of organizations',
        );
        expect(error.code).to.equal('UNABLE_TO_ATTACH_PARENT_ORGANIZATION_AS_CHILD_ORGANIZATION');
        expect(error.meta).to.deep.equal({
          childOrganizationId,
        });
      });
    });
  });

  context('success cases', function () {
    it('attach child organization to parent organization', async function () {
      // given
      const parentOrganizationId = 12;
      const childOrganization = domainBuilder.buildOrganizationForAdmin({ id: 1234 });

      organizationForAdminRepository.get.resolves(childOrganization);
      organizationForAdminRepository.findChildrenByParentOrganizationId.resolves([]);
      organizationForAdminRepository.update.resolves();

      // when
      await attachChildOrganizationToOrganization({
        childOrganizationId: childOrganization.id,
        parentOrganizationId,
        organizationForAdminRepository,
      });

      // then
      const expectedChildOrganization = domainBuilder.buildOrganizationForAdmin({ id: 1234, parentOrganizationId });
      expect(organizationForAdminRepository.get).to.have.been.calledWithExactly(childOrganization.id);
      expect(organizationForAdminRepository.update).to.have.been.calledWith(expectedChildOrganization);
    });
  });
});
