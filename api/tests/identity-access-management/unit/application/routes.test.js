import sinon from 'sinon';

import { identityAccessManagementRoutes } from '../../../../src/identity-access-management/application/routes.js';

describe('Unit | Identity Access Management | Application | Routes', function () {
  let routes;
  let server;

  beforeEach(function () {
    routes = [
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
    it('registers all routes', function () {
      // given
      const options = { routes, tags: undefined };

      // when
      identityAccessManagementRoutes[0].register(server, options);

      // then
      expect(server.route).to.have.been.calledOnceWith(routes);
    });
  });

  context('when tags are given', function () {
    it('registers routes having at least one of the tags', function () {
      // given
      const options = { routes, tags: ['tag2', 'tag4'] };

      // when
      identityAccessManagementRoutes[0].register(server, options);

      // then
      expect(server.route).to.have.been.calledOnceWith([
        { config: { tags: ['tag1', 'tag2'] } },
        { options: { tags: ['tag4'] } },
        { options: { tags: ['tag2', 'tag5'] } },
      ]);
    });
  });
});
