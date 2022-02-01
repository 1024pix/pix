import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../../helpers/create-glimmer-component';
import ENV from 'pix-admin/config/environment';

module('Unit | Component | users | user-detail-personal-information', function (hooks) {
  setupTest(hooks);

  module('#externalURL', function () {
    test('it should generate dashboard URL based on environment and object', async function (assert) {
      // given
      const component = createGlimmerComponent('component:users/user-detail-personal-information/user-overview');

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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(actualUrl, expectedUrl);
    });
  });

  module('#canModifyEmail', function () {
    module('when user already has an email', function () {
      test('it should allow email modification', async function (assert) {
        // given
        const component = createGlimmerComponent('component:users/user-detail-personal-information/user-overview');
        const user = { email: 'lisa@example.net', firstName: 'Lisa', lastName: 'Dupont' };
        component.args.user = user;

        // when & then
        assert.true(component.canModifyEmail);
      });
    });

    module('when user has an username', function () {
      test('it should also allow email modification', async function (assert) {
        // given
        const component = createGlimmerComponent('component:users/user-detail-personal-information/user-overview');
        const user = { username: 'lisa.dupont', firstName: 'Lisa', lastName: 'Dupont' };
        component.args.user = user;

        // when & then
        assert.true(component.canModifyEmail);
      });
    });

    module('when user has neither a username nor an email', function () {
      test('it should not allow email modification', async function (assert) {
        // given
        const component = createGlimmerComponent('component:users/user-detail-personal-information/user-overview');
        const user = { firstName: 'Lisa', lastName: 'Dupont' };
        component.args.user = user;

        // when & then
        assert.false(component.canModifyEmail);
      });
    });
  });
});
