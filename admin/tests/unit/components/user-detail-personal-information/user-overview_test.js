import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import ENV from 'pix-admin/config/environment';

module('Unit | Component | user-detail-personal-information', function (hooks) {
  setupTest(hooks);

  module('#externalURL', function () {
    test('it should generate dashboard URL based on environment and object', async function (assert) {
      // given
      const component = createGlimmerComponent('component:user-detail-personal-information/user-overview');

      const args = {
        user: {
          id: 1,
        },
      };
      const baseUrl = 'https://metabase.pix.fr/dashboard/132?id=';
      const expectedUrl = baseUrl + args.user.id;

      ENV.APP.USER_DASHBOARD_URL = baseUrl;
      component.args = args;

      // when
      const actualUrl = component.externalURL;

      // then
      assert.equal(actualUrl, expectedUrl);
    });
  });

  module('#canModifyEmail', function () {
    module('when user has already an email', function () {
      test('it should allow to modify email', async function (assert) {
        // given
        const component = createGlimmerComponent('component:user-detail-personal-information/user-overview');
        const user = { email: 'lisa@example.net', firstName: 'Lisa', lastName: 'Dupont' };
        component.args.user = user;

        // when & then
        assert.true(component.canModifyEmail);
      });
    });

    module('when user has an username', function () {
      test('it should allow to modify email too', async function (assert) {
        // given
        const component = createGlimmerComponent('component:user-detail-personal-information/user-overview');
        const user = { username: 'lisa@example.net', firstName: 'Lisa', lastName: 'Dupont' };
        component.args.user = user;

        // when & then
        assert.true(component.canModifyEmail);
      });
    });

    module('when user has neither username or email', function () {
      test('it should not allow to modify email', async function (assert) {
        // given
        const component = createGlimmerComponent('component:user-detail-personal-information/user-overview');
        const user = { firstName: 'Lisa', lastName: 'Dupont' };
        component.args.user = user;

        // when & then
        assert.false(component.canModifyEmail);
      });
    });
  });
});
