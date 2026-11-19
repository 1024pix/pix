import { expect } from 'chai';
import sinon from 'sinon';

import { CouldNotDeleteLearnersError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { OrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearner.js';
import { services } from '../../../../../../src/prescription/learner-management/domain/services/index.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { CLIENTS, PIX_ORGA } from '../../../../../../src/shared/constants.js';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | UseCase | Learners Management | delete-organization-learners', function () {
  let organizationId;
  let adminUserId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    adminUserId = databaseBuilder.factory.buildUser().id;
  });

  it('calls service with the correct learners and params', async function () {
    // given
    const learner1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
    const learner2 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
    const learner3 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
    await databaseBuilder.commit();

    const deleteStub = sinon.stub(services, 'deleteOrganizationLearnersService');

    // when
    await usecases.deleteOrganizationLearners({
      userId: adminUserId,
      organizationLearnerIds: [learner1.id, learner2.id, learner3.id],
      organizationId,
      userRole: PIX_ORGA.ROLES.ADMIN,
      client: CLIENTS.ORGA,
      disableAuditLogger: true,
    });

    // then
    expect(deleteStub).calledWith({
      organizationLearners: [
        new OrganizationLearner(learner1),
        new OrganizationLearner(learner2),
        new OrganizationLearner(learner3),
      ],
      userId: adminUserId,
      organizationId,
      userRole: PIX_ORGA.ROLES.ADMIN,
      client: CLIENTS.ORGA,
      disableAuditLogger: true,
    });
  });

  context('when organizationLearnerIds param is empty', function () {
    it('does not call service', async function () {
      // given
      const deleteStub = sinon.stub(services, 'deleteOrganizationLearnersService');

      // when
      await usecases.deleteOrganizationLearners({
        userId: adminUserId,
        organizationLearnerIds: [],
        organizationId,
        userRole: PIX_ORGA.ROLES.ADMIN,
        client: CLIENTS.ORGA,
      });

      // then
      expect(deleteStub.notCalled).to.be.true;
    });
  });

  context('when no organization learners match the organizationLearnerIds param', function () {
    it('logs an error, throws a CouldNotDeleteLearnersError and does not call the service', async function () {
      // given
      databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      await databaseBuilder.commit();

      const deleteStub = sinon.stub(services, 'deleteOrganizationLearnersService');
      const loggerErrorStub = sinon.stub(logger, 'error');

      // when
      const error = await catchErr(usecases.deleteOrganizationLearners)({
        userId: adminUserId,
        organizationLearnerIds: [123, 456, 789],
        organizationId,
        userRole: PIX_ORGA.ROLES.ADMIN,
        client: CLIENTS.ORGA,
        disableAuditLogger: true,
      });

      // then
      expect(error).to.be.an.instanceOf(CouldNotDeleteLearnersError);
      expect(loggerErrorStub).to.have.been.called;
      expect(deleteStub).to.not.have.been.called;
    });
  });

  context('when some organizationLearnerIds do not belong to the organization', function () {
    it('logs an error, throws a CouldNotDeleteLearnersError and does not call the service', async function () {
      // given
      const learner1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const learnerFromOtherOrganization = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: otherOrganizationId,
      });
      await databaseBuilder.commit();

      const deleteStub = sinon.stub(services, 'deleteOrganizationLearnersService');
      const loggerErrorStub = sinon.stub(logger, 'error');
      const organizationLearnerIds = [learner1.id, learnerFromOtherOrganization.id];

      // when
      const error = await catchErr(usecases.deleteOrganizationLearners)({
        userId: adminUserId,
        organizationLearnerIds,
        organizationId,
        userRole: PIX_ORGA.ROLES.ADMIN,
        client: CLIENTS.ORGA,
        disableAuditLogger: true,
      });

      // then
      expect(error).to.be.an.instanceOf(CouldNotDeleteLearnersError);
      expect(loggerErrorStub).to.have.been.calledOnceWithExactly(
        `User id ${adminUserId} could not delete organization learners because some learner id in (${organizationLearnerIds.join(',')}) don't belong to organization id ${organizationId}`,
      );
      expect(deleteStub).to.not.have.been.called;
    });
  });
});
