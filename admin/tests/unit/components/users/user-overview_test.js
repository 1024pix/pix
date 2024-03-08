import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | users | user-overview', function (hooks) {
  setupTest(hooks);

  module('#externalURL', function () {
    test('it should generate dashboard URL based on environment and object', async function (assert) {
      // given
      const component = createGlimmerComponent('component:users/user-overview');

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
      assert.strictEqual(actualUrl, expectedUrl);
    });
  });

  module('#canModifyEmail', function () {
    module('when user already has an email', function () {
      test('it should allow email modification', async function (assert) {
        // given
        const component = createGlimmerComponent('component:users/user-overview');
        const user = { email: 'lisa@example.net', firstName: 'Lisa', lastName: 'Dupont' };
        component.args.user = user;

        // when & then
        assert.true(component.canModifyEmail);
      });
    });

    module('when user has an username', function () {
      test('it should also allow email modification', async function (assert) {
        // given
        const component = createGlimmerComponent('component:users/user-overview');
        const user = { username: 'lisa.dupont', firstName: 'Lisa', lastName: 'Dupont' };
        component.args.user = user;

        // when & then
        assert.true(component.canModifyEmail);
      });
    });

    module('when user has neither a username nor an email', function () {
      test('it should not allow email modification', async function (assert) {
        // given
        const component = createGlimmerComponent('component:users/user-overview');
        const user = { firstName: 'Lisa', lastName: 'Dupont' };
        component.args.user = user;

        // when & then
        assert.false(component.canModifyEmail);
      });
    });
  });

  module('#shouldDisplayTemporaryBlockedDate', function () {
    module('when user has no login informations yet', function () {
      test('should not display temporary blocked date', function (assert) {
        // given
        const component = createGlimmerComponent('component:users/user-overview');

        // when && then
        assert.false(component.shouldDisplayTemporaryBlockedDate);
      });
    });

    module('when user has login but not temporary blocked', function () {
      test('should not display temporary blocked date', function (assert) {
        // given
        const component = createGlimmerComponent('component:users/user-overview');
        const user = { firstName: 'Lisa', lastName: 'Dupont' };
        component.args.user = user;
        const getTemporaryBlockedUntilProperty = () => null;
        const userLoginProxy = { get: getTemporaryBlockedUntilProperty };
        component.args.user.userLogin = userLoginProxy;

        // when && then
        assert.false(component.shouldDisplayTemporaryBlockedDate);
      });
    });

    module('when user has login and temporary blocked date', function () {
      test('should display temporary blocked date when now date is after temporaty blocked date', function (assert) {
        // given
        const component = createGlimmerComponent('component:users/user-overview');
        const user = { firstName: 'Lisa', lastName: 'Dupont' };
        const getTemporaryBlockedUntilProperty = () => new Date(Date.now() + 3600 * 1000);
        const userLoginProxy = { get: getTemporaryBlockedUntilProperty };
        component.args.user = user;
        component.args.user.userLogin = userLoginProxy;

        // when && then
        assert.true(component.shouldDisplayTemporaryBlockedDate);
      });

      test('should not display temporary blocked date when now date is before temporaty blocked date', function (assert) {
        // given
        const component = createGlimmerComponent('component:users/user-overview');
        const user = { firstName: 'Lisa', lastName: 'Dupont' };
        component.args.user = user;
        const getTemporaryBlockedUntilProperty = () => new Date(Date.now() - 3600 * 1000);
        const userLoginProxy = { get: getTemporaryBlockedUntilProperty };
        component.args.user.userLogin = userLoginProxy;

        // when && then
        assert.false(component.shouldDisplayTemporaryBlockedDate);
      });
    });
  });

  module('#anonymizeUser', function () {
    test('should empty organization learners', async function (assert) {
      // given
      const organizationLearners = [{ firstName: 'fanny', lastName: 'epi' }];
      const user = { organizationLearners, save: sinon.stub().resolves() };
      const component = createGlimmerComponent('component:users/user-overview', { user });

      // when
      await component.anonymizeUser();

      // then
      assert.deepEqual(user.organizationLearners, []);
    });
  });
});
