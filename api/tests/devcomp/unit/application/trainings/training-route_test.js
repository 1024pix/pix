import sinon from 'sinon';

import { trainingController } from '../../../../../src/devcomp/application/trainings/training-controller.js';
import { trainingRoute as moduleUnderTest } from '../../../../../src/devcomp/application/trainings/training-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Devcomp | Application | Trainings | training-route', function () {
  describe('DELETE /api/admin/trainings/{trainingId}/triggers/{trainingTriggerId}', function () {
    it('should call security prehandler', async function () {
      // given
      sinon.stub(trainingController, 'deleteTrainingTrigger').resolves('ok');
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/admin/trainings/12/triggers/14';

      // when
      await httpTestServer.request('DELETE', url);

      // then
      expect(trainingController.deleteTrainingTrigger.called).true;
      expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.been.calledWithExactly([
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
      ]);
    });
  });
});
