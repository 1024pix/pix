import sinon from 'sinon';

import {
  anonymizeByUserId,
  deleteOrganizationLearnerBeforeImportFeature,
  hasBeenLearner,
} from '../../../../../../src/prescription/learner-management/application/api/learners-api.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';

import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Prescription | learner management | Api | learners', function () {
  describe('#hasBeenLearner', function () {
    it('should throw a "TypeError" when "userId" is not defined', async function () {
      // given
      const hasBeenLearnerStub = sinon.stub(usecases, 'hasBeenLearner');

      // when
      const error = await catchErr(hasBeenLearner)({ userId: undefined });

      // then
      expect(error).to.be.instanceOf(TypeError);
      expect(hasBeenLearnerStub).to.not.have.been.called;
    });

    it('should check if "userId" in param has been a learner', async function () {
      // given
      const hasBeenLearnerStub = sinon.stub(usecases, 'hasBeenLearner').resolves(true);
      const userId = 1;

      // when
      const result = await hasBeenLearner({ userId });

      // then
      expect(result).to.be.true;
      expect(hasBeenLearnerStub).to.have.been.calledOnceWith({ userId });
    });
  });

  describe('#deleteOrganizationLearnerBeforeImportFeature', function () {
    let findOrganizationLearnersBeforeImportFeatureStub, deleteOrganizationLearnersStub;

    beforeEach(function () {
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });

      findOrganizationLearnersBeforeImportFeatureStub = sinon
        .stub(usecases, 'findOrganizationLearnersBeforeImportFeature')
        .rejects();
      deleteOrganizationLearnersStub = sinon.stub(usecases, 'deleteOrganizationLearners').rejects();
    });

    it('should throw a "TypeError" when "userId" is not defined', async function () {
      // when
      const error = await catchErr(deleteOrganizationLearnerBeforeImportFeature)({
        userId: undefined,
        organizationId: Symbol('organizationId'),
      });

      // then
      expect(error).to.be.instanceOf(TypeError);
      expect(findOrganizationLearnersBeforeImportFeatureStub).to.not.have.been.called;
      expect(deleteOrganizationLearnersStub).to.not.have.been.called;
    });

    it('should throw a "TypeError" when "organizationId" is not defined', async function () {
      // when
      const error = await catchErr(deleteOrganizationLearnerBeforeImportFeature)({
        userId: Symbol('userId'),
        organizationId: undefined,
      });

      // then
      expect(error).to.be.instanceOf(TypeError);
      expect(findOrganizationLearnersBeforeImportFeatureStub).to.not.have.been.called;
      expect(deleteOrganizationLearnersStub).to.not.have.been.called;
    });

    it('should call usecase given parameter', async function () {
      // given
      const userId = Symbol('userId');
      const organizationId = Symbol('organizationId');
      const organizationLearnerIds = Symbol('organizationLearnerIds');

      findOrganizationLearnersBeforeImportFeatureStub.withArgs({ organizationId }).resolves(organizationLearnerIds);
      deleteOrganizationLearnersStub
        .withArgs({ userId, organizationId, organizationLearnerIds, userRole: 'SUPER_ADMIN', client: 'PIX_ADMIN' })
        .resolves();

      // when
      await deleteOrganizationLearnerBeforeImportFeature({ userId, organizationId });

      // then
      expect(findOrganizationLearnersBeforeImportFeatureStub).to.have.been.calledOnce;
      expect(deleteOrganizationLearnersStub).to.have.been.calledOnce;
    });
  });

  describe('#anonymizeByUserId', function () {
    beforeEach(function () {
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
    });

    it('should call anonymizeUser usecase with correct parameters', async function () {
      // given
      const anonymizeUserStub = sinon.stub(usecases, 'anonymizeUser').resolves();
      const userId = 1;

      // when
      await anonymizeByUserId({ userId });

      // then
      expect(anonymizeUserStub).to.have.been.calledOnceWith({ userId });
    });
  });
});
