import { expect } from 'chai';
import sinon from 'sinon';

import { ltiRoute } from '../../../../src/lti/application/lti.route.js';
import { ltiRoutes } from '../../../../src/lti/application/routes.js';

describe('Unit | lti | Application | Routes', function () {
  let featureToggles, server;

  beforeEach(function () {
    featureToggles = { get: sinon.stub() };
    server = { route: sinon.stub() };
  });

  context('when isLtiEnabled feature toggle is true', function () {
    it('registers lti routes', async function () {
      // given
      featureToggles.get.withArgs('isLtiEnabled').resolves(true);
      const dependencies = { featureToggles };

      // when
      await ltiRoutes[0].register(server, {}, dependencies);

      // then
      expect(server.route).to.have.been.calledOnceWith(ltiRoute);
    });
  });

  context('when isLtiEnabled feature toggle is false', function () {
    it('does not register lti routes', async function () {
      // given
      featureToggles.get.withArgs('isLtiEnabled').resolves(false);
      const dependencies = { featureToggles };

      // when
      await ltiRoutes[0].register(server, {}, dependencies);

      // then
      expect(server.route).to.not.have.been.called;
    });
  });
});
