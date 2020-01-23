import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';

import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/session | session-finalizer', function(hooks) {
  setupRenderingTest(hooks);

  let store;
  let session;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
      session = store.createRecord('session', {
        id: 1,
        date: '2019-02-18',
        time: '14:00:00',
      });
      this.set('session', session);
      this.set('finalizeSession', () => {});
      this.set('openModal', () => {});
      this.set('closeModal', () => {});
    });
  });

  module('when showConfirmModal is set to false', function(hooks) {
    hooks.beforeEach(function() {
      this.set('showConfirmModal', false);
    });

    test('it should display all texts (title and indications)', async function(assert) {
      // when
      await render(hbs`{{
        routes/authenticated/sessions/session-finalizer 
        session=session
        finalizeSession=finalizeSession
        openModal=openModal
        closeModal=closeModal
        showConfirmModal=showConfirmModal}}`);

      // then
      assert.dom('.page-title').hasText('Finaliser la session 1');
      assert.dom('.session-finalizer__subtitle').hasText('Pour finaliser la session, complétez les trois étapes puis validez.');
    });
  });

  module('when showConfirmModal is set to true', function(hooks) {
    hooks.beforeEach(function() {
      this.set('showConfirmModal', true);
    });

    test('it should display the modal texts', async function(assert) {
      // when
      await render(hbs`{{
        routes/authenticated/sessions/session-finalizer 
        session=session
        finalizeSession=finalizeSession
        openModal=openModal
        closeModal=closeModal
        showConfirmModal=showConfirmModal}}`);

      // then
      assert.dom('.pix-modal__close-link > a').hasText('Fermer');
      assert.dom('.app-modal-body__attention').hasText('Vous êtes sur le point de finaliser cette session.');
      assert.dom('.app-modal-body__warning > p').hasText('Attention : il ne vous sera plus possible de modifier ces informations par la suite.');
      assert.dom('.pix-modal-footer > .button--red').hasText('Confirmer');
      assert.dom('.pix-modal-footer > .button--grey').hasText('Annuler');
    });
  });

});
