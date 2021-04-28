import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | student', function(hooks) {

  setupTest(hooks);
  module('#authenticationMethods', function() {

    module('when not reconciled', function() {
      test('it should return empty message', function(assert) {
        // given
        const store = this.owner.lookup('service:store');
        const student = { lastName: 'Last', firstName: 'First', birthdate: '2010-10-10' };
        // when
        const model = store.createRecord('student', student);
        // then
        assert.deepEqual(model.authenticationMethods, ['pages.students-sco.connection-types.empty']);
      });
    });

    module('when reconciled', function() {

      module('single authentication method', function() {
        test('it should return Identifiant message key when identified by username', function(assert) {
          // given
          const store = this.owner.lookup('service:store');
          const student = {
            lastName: 'Carter',
            firstName: 'Blue Ivy',
            birthdate: '2012-01-07',
            username: 'blueivy.carter0701',
          };
          // when
          const model = store.createRecord('student', student);
          // then
          assert.deepEqual(model.authenticationMethods, ['pages.students-sco.connection-types.identifiant']);
        });
        test('it should return Adresse e-mail message key when identified by email', function(assert) {
          // given
          const store = this.owner.lookup('service:store');
          const student = {
            lastName: 'De Cambridge',
            firstName: 'George',
            birthdate: '2013-07-22',
            email: 'georges.decambridge@example.net',
          };
          // when
          const model = store.createRecord('student', student);
          // then
          assert.deepEqual(model.authenticationMethods, ['pages.students-sco.connection-types.email']);
        });
        test('it should return Mediacentre message key when identified from GAR', function(assert) {
          // given
          const store = this.owner.lookup('service:store');
          const student = {
            lastName: 'De Cambridge',
            firstName: 'George',
            birthdate: '2013-07-22',
            isAuthenticatedFromGar: true,
          };
          // when
          const model = store.createRecord('student', student);
          // then
          assert.deepEqual(model.authenticationMethods, ['pages.students-sco.connection-types.mediacentre']);
        });
      });

      module('multiple authentication method', function() {

        test('it should return 2 message keys, excluding GAR', function(assert) {
          // given
          const store = this.owner.lookup('service:store');
          const student = {
            lastName: 'Carter',
            firstName: 'Blue Ivy',
            birthdate: '2012-01-07',
            username: 'blueivy.carter0701',
            email: 'carter.blueivy@example.net',
            isAuthenticatedFromGar: false,
          };
          // when
          const model = store.createRecord('student', student);
          // then
          assert.deepEqual(model.authenticationMethods, [
            'pages.students-sco.connection-types.email',
            'pages.students-sco.connection-types.identifiant',
          ]);
        });
      });

    });
  });

  module('#isStudentAssociated', function(hooks) {
    let store;
    hooks.beforeEach(function() {
      store = this.owner.lookup('service:store');
    });

    test('it returns false when the student has no email, no username or is not authenticated from GAR', function(assert) {
      const student = store.createRecord('student', { email: null, username: null, isAuthenticatedFromGar: false });

      assert.equal(student.isStudentAssociated, false);
    });

    test('it returns true when the student has an email', function(assert) {
      const student = store.createRecord('student', { email: 'martin.riggs@example.net', username: null, isAuthenticatedFromGar: false });

      assert.equal(student.isStudentAssociated, true);
    });

    test('it returns true when the student has an username', function(assert) {
      const student = store.createRecord('student', { email: null, username: 'RogerMurtaugh', isAuthenticatedFromGar: false });

      assert.equal(student.isStudentAssociated, true);
    });

    test('it returns true when the student is authenticated from GAR', function(assert) {
      const student = store.createRecord('student', { email: null, username: null, isAuthenticatedFromGar: true });

      assert.equal(student.isStudentAssociated, true);
    });
  });

  module('#displayAddUsernameAuthentication', function(hooks) {
    let store;
    hooks.beforeEach(function() {
      store = this.owner.lookup('service:store');
    });

    test('it returns true if the student is authenticated by email only', function(assert) {
      const student = store.createRecord('student', { email: 'john.harry@example.net', username: null, isAuthenticatedFromGar: false });

      assert.equal(student.displayAddUsernameAuthentication, true);
    });

    test('it returns true if the student is authenticated from mediacenter only', function(assert) {
      const student = store.createRecord('student', { email: null, username: null, isAuthenticatedFromGar: true });

      assert.equal(student.displayAddUsernameAuthentication, true);
    });

  });
});
