import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Component | live-alert-handled-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it shows the alert has been dismissed and close button', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const candidate = store.createRecord('certification-candidate', {
      firstName: 'Jean-Paul',
      lastName: 'Candidat',
      liveAlertStatus: 'ongoing',
    });

    this.set('isModalDisplayed', sinon.stub());
    this.set('closeModal', sinon.stub());
    this.set('candidateFullName', `${candidate.firstName} ${candidate.lastName}`);

    // when
    const screen = await renderScreen(hbs`
        <SessionSupervising::LiveAlertHandledModal
          @showModal={{this.isModalDisplayed}}
          @closeConfirmationModal={{this.closeModal}}
          @title={{this.candidateFullName}}
          @isLiveAlertValidated={{false}}
        />
      `);

    // then
    assert.dom(screen.getByText('Le signalement a bien été refusé', { exact: false })).exists();
    assert.dom(screen.getByText('Jean-Paul Candidat')).exists();
    assert.dom(screen.getByRole('button', { name: 'Fermer' })).exists();
  });

  test('it shows the alert has been validated and close button', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const candidate = store.createRecord('certification-candidate', {
      firstName: 'Jean-Paul',
      lastName: 'Candidat',
      liveAlertStatus: 'ongoing',
    });

    this.set('isModalDisplayed', sinon.stub());
    this.set('closeModal', sinon.stub());
    this.set('candidateFullName', `${candidate.firstName} ${candidate.lastName}`);

    // when
    const screen = await renderScreen(hbs`
        <SessionSupervising::LiveAlertHandledModal
          @showModal={{this.isModalDisplayed}}
          @closeConfirmationModal={{this.closeModal}}
          @title={{this.candidateFullName}}
          @isLiveAlertValidated={{true}}
        />
      `);

    // then
    assert.dom(screen.getByText('Le signalement a bien été validé', { exact: false })).exists();
    assert.dom(screen.getByText('Jean-Paul Candidat')).exists();
    assert.dom(screen.getByRole('button', { name: 'Fermer' })).exists();
  });
});
