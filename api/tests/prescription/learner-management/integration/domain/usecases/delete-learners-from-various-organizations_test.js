import { expect } from 'chai';
import sinon from 'sinon';

import { OrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearner.js';
import { services } from '../../../../../../src/prescription/learner-management/domain/services/index.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { CLIENTS, PIX_ADMIN } from '../../../../../../src/shared/constants.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | Learners Management | delete-learners-from-various-organizations', function () {
  let organizationId;
  let adminUserId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    adminUserId = databaseBuilder.factory.buildUser().id;
  });

  context('when organizationLearnerIds param is empty', function () {
    it('does not call service', async function () {
      // given
      const deleteStub = sinon.stub(services, 'deleteOrganizationLearnersService');

      // when
      await usecases.deleteLearnersFromVariousOrganizations({
        userId: adminUserId,
        organizationLearnerIds: [],
        organizationId,
        userRole: PIX_ADMIN.ROLES.SUPPORT,
        client: CLIENTS.ADMIN,
      });

      // then
      expect(deleteStub.notCalled).to.be.true;
    });
  });

  context('when no organization learners match the organizationLearnerIds param', function () {
    it('does not call the service', async function () {
      // given
      databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      await databaseBuilder.commit();

      const deleteStub = sinon.stub(services, 'deleteOrganizationLearnersService');

      // when
      await usecases.deleteLearnersFromVariousOrganizations({
        userId: adminUserId,
        organizationLearnerIds: [123, 456, 789],
        organizationId,
        userRole: PIX_ADMIN.ROLES.SUPPORT,
        client: CLIENTS.ADMIN,
      });

      // then
      expect(deleteStub.notCalled).to.be.true;
    });
  });

  context('when learners are from the same organization', function () {
    it('calls service once with the correct learners and params', async function () {
      // given
      const learner1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const learner2 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const learner3 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      await databaseBuilder.commit();

      const deleteStub = sinon.stub(services, 'deleteOrganizationLearnersService');

      // when
      await usecases.deleteLearnersFromVariousOrganizations({
        userId: adminUserId,
        organizationLearnerIds: [learner1.id, learner2.id, learner3.id],
        organizationId,
        userRole: PIX_ADMIN.ROLES.SUPPORT,
        client: CLIENTS.ADMIN,
      });

      // then
      const calls = deleteStub.getCalls();
      expect(calls.length).equal(1);
      expect(calls[0]).calledWith({
        organizationLearners: [
          new OrganizationLearner(learner1),
          new OrganizationLearner(learner2),
          new OrganizationLearner(learner3),
        ],
        organizationId,
        userId: adminUserId,
        userRole: PIX_ADMIN.ROLES.SUPPORT,
        client: CLIENTS.ADMIN,
      });
    });
  });

  context('when learners are from N organizations', function () {
    it('calls service N times with the correct learners and params', async function () {
      // given
      const learner1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const learner2 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });

      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const learner3 = databaseBuilder.factory.buildOrganizationLearner({ organizationId: otherOrganizationId });
      await databaseBuilder.commit();

      const deleteStub = sinon.stub(services, 'deleteOrganizationLearnersService');

      // when
      await usecases.deleteLearnersFromVariousOrganizations({
        userId: adminUserId,
        organizationLearnerIds: [learner1.id, learner2.id, learner3.id],
        organizationId,
        userRole: PIX_ADMIN.ROLES.SUPPORT,
        client: CLIENTS.ADMIN,
      });

      // then
      const calls = deleteStub.getCalls();
      expect(calls.length).equal(2);
      expect(calls[0]).calledWith({
        organizationLearners: [new OrganizationLearner(learner1), new OrganizationLearner(learner2)],
        organizationId,
        userId: adminUserId,
        userRole: PIX_ADMIN.ROLES.SUPPORT,
        client: CLIENTS.ADMIN,
      });
      expect(calls[1]).calledWith({
        organizationLearners: [new OrganizationLearner(learner3)],
        organizationId: otherOrganizationId,
        userId: adminUserId,
        userRole: PIX_ADMIN.ROLES.SUPPORT,
        client: CLIENTS.ADMIN,
      });
    });
  });
});
