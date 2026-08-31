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

        test('it adds an error with its translation in error service', async function (assert) {
          // given
          const params = {
            temporary_key: 'pwd-reset-demand-token',
          };

          requestManagerService.request.rejects({
            errors: [
              {
                status: 401,
              },
            ],
          });

          // when
          await route.model(params);

          // then
          assert.strictEqual(errorService.errors.length, 1);
          const errorTranslationKey = 'pages.reset-password.error.expired-demand';
          assert.strictEqual(errorService.errors[0], errorTranslationKey);
        });
      });
    });
  });
});
