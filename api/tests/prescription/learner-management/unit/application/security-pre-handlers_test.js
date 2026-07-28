import sinon from 'sinon';

import { learnerManagementSecurityPreHandlers } from '../../../../../src/prescription/learner-management/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Prescription | Learner Management | Application | checkOrganizationLearnerBelongsToOrganization', function () {
  let checkOrganizationLearnerBelongsToOrganizationUseCaseStub;
  let dependencies;

  beforeEach(function () {
    checkOrganizationLearnerBelongsToOrganizationUseCaseStub = { execute: sinon.stub() };
    dependencies = {
      checkOrganizationLearnerBelongsToOrganizationUseCase: checkOrganizationLearnerBelongsToOrganizationUseCaseStub,
    };
  });

  context('Successful cases', function () {
    it('should authorize access when organization learner belongs to the organization', async function () {
      // given
      const request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
        params: {
          organizationId: 5678,
          organizationLearnerId: 9999,
        },
      };
      dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute.resolves(true);

      // when
      const response = await learnerManagementSecurityPreHandlers.checkOrganizationLearnerBelongsToOrganization(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(response.source).to.be.true;
      expect(dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute).to.have.been.calledWith(
        5678,
        9999,
      );
    });
  });

  context('Error cases', function () {
    it('should forbid resource access when organization learner does not belong to the organization', async function () {
      // given
      const request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
        params: {
          organizationId: 5678,
          organizationLearnerId: 9999,
        },
      };
      dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute.resolves(false);

      // when
      const response = await learnerManagementSecurityPreHandlers.checkOrganizationLearnerBelongsToOrganization(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.isTakeOver).to.be.true;
      expect(dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute).to.have.been.calledWith(
        5678,
        9999,
      );
    });

    it('should forbid resource access when use case throws an error', async function () {
      // given
      const request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
        params: {
          organizationId: 5678,
          organizationLearnerId: 9999,
        },
      };
      dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute.rejects(new Error('Some error'));

      // when
      const response = await learnerManagementSecurityPreHandlers.checkOrganizationLearnerBelongsToOrganization(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.isTakeOver).to.be.true;
      expect(dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute).to.have.been.calledWith(
        5678,
        9999,
      );
    });
  });
});
