import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | companion-live-alert-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it shows the modal confirmation', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const candidate = store.createRecord('certification-candidate', {
      firstName: 'Alain',
      lastName: 'Cendy',
      companionLiveAlert: {
        type: 'companion',
        status: 'ONGOING',
      },
    });

    this.set('isHandleCompanionLiveAlertModalDisplayed', sinon.stub());
    this.set('closeHandleLiveAlertModal', sinon.stub());
    this.set('clearedLiveAlert', sinon.stub());
    this.set('candidateFullName', `${candidate.firstName} ${candidate.lastName}`);

    // when
    const screen = await renderScreen(hbs`<SessionSupervising::CompanionLiveAlertModal
  @showModal={{this.isHandleCompanionLiveAlertModalDisplayed}}
  @closeConfirmationModal={{this.closeHandleLiveAlertModal}}
  @candidateFullName={{this.candidateFullName}}
  @clearedLiveAlert={{this.clearedLiveAlert}}
/>`);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Confirmer que Alain Cendy a bien l’extension ?' })).exists();
    assert
      .dom(
        screen.getByText('Cette action permettra au candidat de reprendre son test à l’endroit où il l’avait quitté.'),
      )
      .exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert
      .dom(screen.getByRole('button', { name: 'Confirmer la présence de l’extension et traiter le signalement' }))
      .exists();
  });
});
