import sinon from 'sinon';

import { organizationLearnersController } from '../../../../../src/prescription/learner-management/application/organization-learners-controller.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { CLIENTS, PIX_ADMIN } from '../../../../../src/shared/constants.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Prescription | Learner Management | Application | organization-learner-controller', function () {
  describe('#importOrganizationLearnerFromFeature', function () {
    let sendOrganizationLearnersFileStub;

    beforeEach(function () {
      sendOrganizationLearnersFileStub = sinon.stub(usecases, 'sendOrganizationLearnersFile');
    });

    it('should call usecases in correct order', async function () {
      const userId = Symbol('userId');
      const organizationId = Symbol('organizationId');
      const payload = Symbol('payload');
      const request = {
        auth: { credentials: { userId } },
        params: { organizationId },
        payload,
      };

      const response = await organizationLearnersController.importOrganizationLearnerFromFeature(request, hFake);

      expect(
        sendOrganizationLearnersFileStub.calledWithExactly({ payload, organizationId, userId }),
        'sendOrganizationLearnerFile',
      ).to.be.true;

      expect(response.statusCode).to.be.equal(204);
    });
  });

  describe('#reconcileCommonOrganizationLearner', function () {
    let reconcileCommonOrganizationLearnerStub;

    beforeEach(function () {
      reconcileCommonOrganizationLearnerStub = sinon.stub(usecases, 'reconcileCommonOrganizationLearner');
    });

    it('called usecases with correct parameters', async function () {
      const userId = Symbol('userId');
      const organizationId = 123;
      const reconciliationInfos = Symbol('reconciliationInfos');
      const request = {
        auth: { credentials: { userId } },
        deserializedPayload: {
          organizationId,
          reconciliationInfos,
        },
      };

      const response = await organizationLearnersController.reconcileCommonOrganizationLearner(request, hFake);

      expect(
        reconcileCommonOrganizationLearnerStub.calledWithExactly({ userId, organizationId, reconciliationInfos }),
        'reconcileCommonOrganizationLearner',
      ).to.be.true;
      expect(response.statusCode).to.be.equal(204);
    });
  });

  describe('#getOrganizationLearnerFilters', function () {
    it('should call usecase and serialize result', async function () {
      // given
      const organizationId = Symbol('organizationId');
      const filters = Symbol('filters');
      const serialized = Symbol('serialized');

      sinon.stub(usecases, 'getOrganizationLearnerFilters').resolves(filters);
      const organizationLearnerFilterSerializer = { serialize: sinon.stub().returns(serialized) };

      const request = { params: { organizationId } };

      // when
      const response = await organizationLearnersController.getOrganizationLearnerFilters(request, hFake, {
        organizationLearnerFilterSerializer,
      });

      // then
      expect(usecases.getOrganizationLearnerFilters).to.have.been.calledWithExactly({ organizationId });
      expect(organizationLearnerFilterSerializer.serialize).to.have.been.calledWithExactly(filters);
      expect(response).to.equal(serialized);
    });
  });

  describe('#deleteOrganizationLearnerFromAdmin', function () {
    let deleteOrganizationLearnersStub;

    beforeEach(function () {
      deleteOrganizationLearnersStub = sinon.stub(usecases, 'deleteOrganizationLearners');
    });

    it('called usecases with correct parameters', async function () {
      const userId = Symbol('userId');
      const organizationLearnerId = Symbol('organizationLearnerId');
      const organizationId = Symbol('organizationId');

      const request = {
        auth: { credentials: { userId } },
        params: {
          organizationLearnerId,
          organizationId,
        },
      };

      const response = await organizationLearnersController.deleteOrganizationLearnerFromAdmin(request, hFake);

      expect(
        deleteOrganizationLearnersStub.calledWithExactly({
          userId,
          organizationLearnerIds: [organizationLearnerId],
          organizationId,
          userRole: PIX_ADMIN.ROLES.SUPPORT,
          client: CLIENTS.ADMIN,
        }),
        'deleteOrganizationLearners',
      ).to.be.true;
      expect(response.statusCode).to.be.equal(200);
    });
  });
});
