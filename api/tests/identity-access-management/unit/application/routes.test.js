import { expect } from 'chai';
import sinon from 'sinon';

import { identityAccessManagementRoutes } from '../../../../src/identity-access-management/application/routes.js';

describe('Unit | Identity Access Management | Application | Routes', function () {
  let allRoutes, server;

  beforeEach(function () {
    allRoutes = [
      { config: { tags: ['tag1', 'tag2'] } },
      { config: { tags: ['tag3'] } },
      { options: { tags: ['tag3'] } },
      { options: { tags: ['tag4'] } },
      { options: { tags: ['tag2', 'tag5'] } },
    ];

    server = {
      route: sinon.stub(),
    };
  });

  context('when no tags are given', function () {
    it('registers all routes', async function () {
      // given
      const options = { tags: undefined };
      const dependencies = { allRoutes };

      // when
      await identityAccessManagementRoutes[0].register(server, options, dependencies);

      // then
      expect(server.route).to.have.been.calledOnceWith(allRoutes);
    });
  });

  context('when tags are given', function () {
    it('registers routes having at least one of the tags', async function () {
      // given
      const options = { tags: ['tag2', 'tag4'] };
      const dependencies = { allRoutes };

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
