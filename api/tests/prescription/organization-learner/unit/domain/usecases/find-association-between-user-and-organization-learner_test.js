import sinon from 'sinon';

import { OrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearner.js';
import { findAssociationBetweenUserAndOrganizationLearner } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-association-between-user-and-organization-learner.js';
import {
  OrganizationLearnerDisabledError,
  UserNotAuthorizedToAccessEntityError,
} from '../../../../../../src/shared/domain/errors.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | find-association-between-user-and-organization-learner', function () {
  let organizationLearnerReceivedStub;
  let organizationLearner;
  let organization;
  let userId;
  let registrationOrganizationLearnerRepository;

  beforeEach(function () {
    userId = domainBuilder.buildUser().id;
    organization = domainBuilder.buildOrganization();
    organizationLearner = domainBuilder.buildOrganizationLearner({ organization, userId });
    registrationOrganizationLearnerRepository = { findOneByUserIdAndOrganizationId: sinon.stub() };
    organizationLearnerReceivedStub =
      registrationOrganizationLearnerRepository.findOneByUserIdAndOrganizationId.throws('unexpected call');
  });

  describe('There is an organizationLearner linked to the given userId', function () {
    it('should call findOneByUserIdAndOrganizationId', async function () {
      // given
      organizationLearnerReceivedStub.withArgs({ userId, organizationId: organization.id }).resolves({});

      // when
      await findAssociationBetweenUserAndOrganizationLearner({
        authenticatedUserId: userId,
        requestedUserId: userId,
        organizationId: organization.id,
        registrationOrganizationLearnerRepository,
      });

      // then
      expect(organizationLearnerReceivedStub).to.have.been.calledOnce;
    });

    it('should return the OrganizationLearner', async function () {
      // given
      organizationLearnerReceivedStub
        .withArgs({ userId, organizationId: organization.id })
        .resolves(organizationLearner);

      // when
      const result = await findAssociationBetweenUserAndOrganizationLearner({
        authenticatedUserId: userId,
        requestedUserId: userId,
        organizationId: organization.id,
        registrationOrganizationLearnerRepository,
      });

      // then
      expect(result).to.be.deep.equal(organizationLearner);
      expect(result).to.be.instanceof(OrganizationLearner);
    });
  });

  describe('There is no organizationLearner linked to the given userId for the given organizationId', function () {
    it('should return null', async function () {
      // given
      organizationLearnerReceivedStub.withArgs({ userId, organizationId: organization.id }).resolves(null);

      // when
      const result = await findAssociationBetweenUserAndOrganizationLearner({
        authenticatedUserId: userId,
        requestedUserId: userId,
        organizationId: organization.id,
        registrationOrganizationLearnerRepository,
      });

      // then
      expect(result).to.equal(null);
    });
  });

  describe('There is a disabled organizationLearner linked to the given userId', function () {
    it('should throw an error', async function () {
      // given
      const disabledOrganizationLearner = domainBuilder.buildOrganizationLearner({
        organization,
        userId,
        isDisabled: true,
      });
      organizationLearnerReceivedStub
        .withArgs({ userId, organizationId: organization.id })
        .resolves(disabledOrganizationLearner);

      // when
      const result = await catchErr(findAssociationBetweenUserAndOrganizationLearner)({
        authenticatedUserId: userId,
        requestedUserId: userId,
        organizationId: organization.id,
        registrationOrganizationLearnerRepository,
      });

      // then
      expect(result).to.be.instanceof(OrganizationLearnerDisabledError);
    });
  });

  describe('The authenticated user is not the same as requested user', function () {
    it('should return the repositories error', async function () {
      // given
      organizationLearnerReceivedStub.withArgs({ userId, organizationId: organization.id }).resolves(null);

      // when
      const result = await catchErr(findAssociationBetweenUserAndOrganizationLearner)({
        authenticatedUserId: '999',
        requestedUserId: userId,
        organizationId: organization.id,
        registrationOrganizationLearnerRepository,
      });

      // then
      expect(result).to.be.instanceof(UserNotAuthorizedToAccessEntityError);
    });
  });
});
