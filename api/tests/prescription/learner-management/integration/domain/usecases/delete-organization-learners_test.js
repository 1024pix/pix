import { expect } from 'chai';
import sinon from 'sinon';

import { OrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearner.js';
import { services } from '../../../../../../src/prescription/learner-management/domain/services/index.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | Organization Learners Management | Delete Organization Learners', function () {
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
      userRole: 'ORGA_ADMIN',
      client: 'PIX_ORGA',
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
      userRole: 'ORGA_ADMIN',
      client: 'PIX_ORGA',
      disableAuditLogger: true,
    });
  });

  context('when some learners are not in the organization', function () {
    it('calls service with organization learners in the given orga', async function () {
      // given
      const learner1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const learner2 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const learner3 = databaseBuilder.factory.buildOrganizationLearner({ organizationId: otherOrganizationId });
      await databaseBuilder.commit();

      const deleteStub = sinon.stub(services, 'deleteOrganizationLearnersService');

      // when
      await usecases.deleteOrganizationLearners({
        userId: adminUserId,
        organizationLearnerIds: [learner1.id, learner2.id, learner3.id],
        organizationId,
        userRole: 'ORGA_ADMIN',
        client: 'PIX_ORGA',
        disableAuditLogger: true,
      });

      // then
      expect(deleteStub).calledWith({
        organizationLearners: [new OrganizationLearner(learner1), new OrganizationLearner(learner2)],
        userId: adminUserId,
        organizationId,
        userRole: 'ORGA_ADMIN',
        client: 'PIX_ORGA',
        disableAuditLogger: true,
      });
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
        userRole: 'ORGA_ADMIN',
        client: 'PIX_ORGA',
      });

      // then
      expect(deleteStub.notCalled).to.be.true;
    });
  });

  context('when no given organization learners are found for the given organization ID', function () {
    it('does not call the service', async function () {
      // given
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: otherOrganizationId });
      await databaseBuilder.commit();

      const deleteStub = sinon.stub(services, 'deleteOrganizationLearnersService');

      // when
      await usecases.deleteOrganizationLearners({
        userId: adminUserId,
        organizationLearnerIds: [123, 456, 789],
        organizationId,
        userRole: 'ORGA_ADMIN',
        client: 'PIX_ORGA',
        disableAuditLogger: true,
      });

      // then
      expect(deleteStub.notCalled).to.be.true;
    });
  });
});
