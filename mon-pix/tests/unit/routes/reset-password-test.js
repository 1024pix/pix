import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../helpers/setup-intl';

module('Unit | Route | reset-password', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('Route behavior', function () {
    module('when check-password-reset-demand fails', function () {
      module('when error status is 401', function (hooks) {
        let errorService;
        let replaceWithStub;
        let route;
        let routerStub;
        let requestManagerService;

        hooks.beforeEach(function () {
          errorService = this.owner.lookup('service:errors');

          route = this.owner.lookup('route:reset-password');
          replaceWithStub = sinon.stub();
          routerStub = Service.create({
            replaceWith: replaceWithStub,
          });
          route.set('router', routerStub);

          requestManagerService = this.owner.lookup('service:requestManager');
          sinon.stub(requestManagerService, 'request');
        });

        test('it adds an error and redirects to password-reset-demand', async function (assert) {
          // given
          requestManagerService.request.rejects({
            errors: [
              {
                status: 401,
              },
            ],
          });

          // when
          await route.model();

          // then
          assert.strictEqual(errorService.errors.length, 1);
          assert.strictEqual(errorService.errors[0], 'pages.reset-password.error.expired-demand');

          sinon.assert.calledWith(route.router.replaceWith, 'password-reset-demand');
        });
      });
    });
  });
});
