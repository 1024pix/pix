import { expect } from 'chai';
import sinon from 'sinon';

import { identityAccessManagementRoutes } from '../../../../src/identity-access-management/application/routes.js';

describe('Unit | Identity Access Management | Application | Routes', function () {
  let allRoutes, ltiRoutes, featureToggles, server;

  beforeEach(function () {
    allRoutes = [
      { config: { tags: ['tag1', 'tag2'] } },
      { config: { tags: ['tag3'] } },
      { options: { tags: ['tag3'] } },
      { options: { tags: ['tag4'] } },
      { options: { tags: ['tag2', 'tag5'] } },
    ];

    ltiRoutes = [{ options: { tags: ['lti'] } }];

    featureToggles = {
      get: sinon.stub(),
    };

    server = {
      route: sinon.stub(),
    };
  });

  context('when isLtiEnabled feature toggle is true', function () {
    beforeEach(function () {
      featureToggles.get.resolves(true);
    });

    context('when no tags are given', function () {
      it('registers all routes', async function () {
        // given
        const options = { tags: undefined };
        const dependencies = { allRoutes, ltiRoutes, featureToggles };

        // when
        await identityAccessManagementRoutes[0].register(server, options, dependencies);

        // then
        expect(server.route).to.have.been.calledOnceWith([...allRoutes, ...ltiRoutes]);
      });
    });

    context('when tags are given', function () {
      it('registers routes having at least one of the tags', async function () {
        // given
        const options = { routes: allRoutes, ltiRoutes, tags: ['tag2', 'tag4'] };
        const dependencies = { allRoutes, ltiRoutes, featureToggles };

        // when
        await identityAccessManagementRoutes[0].register(server, options, dependencies);

        // then
        expect(server.route).to.have.been.calledOnceWith([
          { config: { tags: ['tag1', 'tag2'] } },
          { options: { tags: ['tag4'] } },
          { options: { tags: ['tag2', 'tag5'] } },
        ]);
      });
    });
  });

  context('when isLtiEnabled feature toggle is false', function () {
    beforeEach(function () {
      featureToggles.get.resolves(false);
    });

    context('when no tags are given', function () {
      it('registers all routes', async function () {
        // given
        const options = { tags: undefined };
        const dependencies = { allRoutes, ltiRoutes, featureToggles };

        // when
        await identityAccessManagementRoutes[0].register(server, options, dependencies);

        // then
        expect(server.route).to.have.been.calledOnceWith(allRoutes);
      });
    });

    context('when tags are given', function () {
      it('registers routes having at least one of the tags', async function () {
        // given
        const options = { routes: allRoutes, ltiRoutes, tags: ['tag2', 'tag4', 'lti'] };
        const dependencies = { allRoutes, ltiRoutes, featureToggles };

        // when
        await identityAccessManagementRoutes[0].register(server, options, dependencies);

        // then
        expect(server.route).to.have.been.calledOnceWith([
          { config: { tags: ['tag1', 'tag2'] } },
          { options: { tags: ['tag4'] } },
          { options: { tags: ['tag2', 'tag5'] } },
        ]);
      });
    });
  });
});
