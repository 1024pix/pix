import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dissociate-user-modal', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('display', true);
    this.set('refreshModel', sinon.stub());
    this.set('close', sinon.stub());

    return render(hbs`<DissociateUserModal @refreshModel={{refreshModel}} @display={{display}} @close={{close}} @student={{student}}/>`);
  });

  module('when the user is authenticated  with an email', function() {

    test('it displays a message for user authentified by email', async function(assert) {
      this.set('student', { hasEmail: true, email: 'rocky.balboa@example.net', firstName: 'Rocky',  lastName: 'Balboa' });

      assert.contains('Souhaitez-vous dissocier le compte rocky.balboa@example.net de l\'élève Rocky Balboa ?');
    });
  });

  module('when the user is authenticated with an username', function() {

    test('it displays a message for user authentified by username', async function(assert) {
      this.set('student', { hasUsername: true, username: 'appolo.creed', firstName: 'Appolo',  lastName: 'Creed' });

      assert.contains('Souhaitez-vous dissocier le compte appolo.creed de l\'élève Appolo Creed ?');
    });
  });

  module('when the user is authenticated with GAR', function() {

    test('it displays a message for user authentified with GAR', async function(assert) {
      this.set('student', { hasEmail: false, hasUsername: false, firstName: 'Ivan', lastName: 'Drago' });

      assert.contains('Souhaitez-vous dissocier le compte du médiacenter de l\'ENT de l\'élève Ivan Drago ?');
    });
  });

  module('dissociate button', function() {
    let studentAdapter;
    let notifications;

    hooks.beforeEach(function() {
      const store = this.owner.lookup('service:store');
      notifications = this.owner.lookup('service:notifications');
      studentAdapter = store.adapterFor('student');
      sinon.stub(studentAdapter, 'dissociateUser');
      sinon.stub(notifications, 'sendSuccess');
      sinon.stub(notifications, 'sendError');
    });

    hooks.afterEach(function() {
      studentAdapter.dissociateUser.restore();
    });

    test('it dissociate user form student on click', async function(assert) {
      const student = { id: 12345 };
      this.set('student', student);

      await click('.dissociate-user-modal__actions button:last-child');

      assert.ok(studentAdapter.dissociateUser.calledWith(student));
    });

    test('it should display a successful notification', async function(assert) {
      const student = { id: 12345, lastName: 'Dupont', firstName: 'Jean' };
      this.set('student', student);

      await click('.dissociate-user-modal__actions button:last-child');

      assert.ok(notifications.sendSuccess.calledWith('La dissociation du compte de l’élève Dupont Jean est réussie.'));
    });

    test('it should display an error notification', async function(assert) {
      studentAdapter.dissociateUser.rejects();
      const student = { id: 12345, lastName: 'Dupont', firstName: 'Jean' };
      this.set('student', student);

      await click('.dissociate-user-modal__actions button:last-child');

      assert.ok(notifications.sendError.calledWith('La dissociation du compte de l’élève Dupont Jean a échoué. Veuillez réessayer.'));
    });
  });

});
