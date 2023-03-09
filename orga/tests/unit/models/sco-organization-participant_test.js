import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | sco-organization-participant', function (hooks) {
  setupTest(hooks);
  module('#authenticationMethods', function () {
    module('when not reconciled', function () {
      test('it should return empty message', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const organizationScoParticipant = { lastName: 'Last', firstName: 'First', birthdate: '2010-10-10' };
        // when
        const model = store.createRecord('sco-organization-participant', organizationScoParticipant);
        // then
        assert.deepEqual(model.authenticationMethods, ['empty']);
      });
    });

    module('when reconciled', function () {
      module('single authentication method', function () {
        test('it should return Identifiant message key when identified by username', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const organizationScoParticipant = {
            lastName: 'Carter',
            firstName: 'Blue Ivy',
            birthdate: '2012-01-07',
            username: 'blueivy.carter0701',
          };
          // when
          const model = store.createRecord('sco-organization-participant', organizationScoParticipant);
          // then
          assert.deepEqual(model.authenticationMethods, ['identifiant']);
        });
        test('it should return Adresse e-mail message key when identified by email', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const organizationScoParticipant = {
            lastName: 'De Cambridge',
            firstName: 'George',
            birthdate: '2013-07-22',
            email: 'georges.decambridge@example.net',
          };
          // when
          const model = store.createRecord('sco-organization-participant', organizationScoParticipant);
          // then
          assert.deepEqual(model.authenticationMethods, ['email']);
        });
        test('it should return Mediacentre message key when identified from GAR', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const organizationScoParticipant = {
            lastName: 'De Cambridge',
            firstName: 'George',
            birthdate: '2013-07-22',
            isAuthenticatedFromGar: true,
          };
          // when
          const model = store.createRecord('sco-organization-participant', organizationScoParticipant);
          // then
          assert.deepEqual(model.authenticationMethods, ['mediacentre']);
        });
      });

      module('multiple authentication method', function () {
        test('it should return 2 message keys, excluding GAR', function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const organizationScoParticipant = {
            lastName: 'Carter',
            firstName: 'Blue Ivy',
            birthdate: '2012-01-07',
            username: 'blueivy.carter0701',
            email: 'carter.blueivy@example.net',
            isAuthenticatedFromGar: false,
          };
          // when
          const model = store.createRecord('sco-organization-participant', organizationScoParticipant);
          // then
          assert.deepEqual(model.authenticationMethods, ['email', 'identifiant']);
        });
      });
    });
  });

  module('#isAssociated', function (hooks) {
    let store;
    hooks.beforeEach(function () {
      store = this.owner.lookup('service:store');
    });

    test('it returns false when the organizationScoParticipant has no email, no username or is not authenticated from GAR', function (assert) {
      const organizationScoParticipant = store.createRecord('sco-organization-participant', {
        email: null,
        username: null,
        isAuthenticatedFromGar: false,
      });

      assert.false(organizationScoParticipant.isAssociated);
    });

    test('it returns true when the organizationScoParticipant has an email', function (assert) {
      const organizationScoParticipant = store.createRecord('sco-organization-participant', {
        email: 'martin.riggs@example.net',
        username: null,
        isAuthenticatedFromGar: false,
      });

      assert.true(organizationScoParticipant.isAssociated);
    });

    test('it returns true when the organizationScoParticipant has an username', function (assert) {
      const organizationScoParticipant = store.createRecord('sco-organization-participant', {
        email: null,
        username: 'RogerMurtaugh',
        isAuthenticatedFromGar: false,
      });

      assert.true(organizationScoParticipant.isAssociated);
    });

    test('it returns true when the organizationScoParticipant is authenticated from GAR', function (assert) {
      const organizationScoParticipant = store.createRecord('sco-organization-participant', {
        email: null,
        username: null,
        isAuthenticatedFromGar: true,
      });

      assert.true(organizationScoParticipant.isAssociated);
    });
  });

  module('#displayAddUsernameAuthentication', function (hooks) {
    let store;
    hooks.beforeEach(function () {
      store = this.owner.lookup('service:store');
    });

    test('it returns true if the organizationScoParticipant is authenticated by email only', function (assert) {
      const organizationScoParticipant = store.createRecord('sco-organization-participant', {
        email: 'john.harry@example.net',
        username: null,
        isAuthenticatedFromGar: false,
      });

      assert.true(organizationScoParticipant.displayAddUsernameAuthentication);
    });

    test('it returns true if the organizationScoParticipant is authenticated from mediacenter only', function (assert) {
      const organizationScoParticipant = store.createRecord('sco-organization-participant', {
        email: null,
        username: null,
        isAuthenticatedFromGar: true,
      });

      assert.true(organizationScoParticipant.displayAddUsernameAuthentication);
    });
  });
});
