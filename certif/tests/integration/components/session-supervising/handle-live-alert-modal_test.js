import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Component | handle-live-alert-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it shows issue report reasons', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const candidate = store.createRecord('certification-candidate');

    this.set('isModalDisplayed', sinon.stub());
    this.set('closeModal', sinon.stub());
    this.set('candidateFullName', `${candidate.firstName} ${candidate.lastName}`);
    this.set('rejectLiveAlert', sinon.stub());

    // when
    const screen = await renderScreen(hbs`
        <SessionSupervising::HandleLiveAlertModal
          @showModal={{this.isModalDisplayed}}
          @closeConfirmationModal={{this.closeModal}}
          @title={{this.candidateFullName}}
          @rejectLiveAlert={{this.rejectLiveAlert}}
        />
      `);

    // then
    const radioButtons = screen.getAllByRole('radio');
    assert.strictEqual(radioButtons.length, 10);
    assert
      .dom(
        screen.getByText(
          this.intl.t('pages.session-finalization.add-issue-modal.subcategory-labels.image-not-displaying'),
        ),
      )
      .exists();
    assert
      .dom(
        screen.getByText(this.intl.t('pages.session-finalization.add-issue-modal.subcategory-labels.file-not-opening')),
      )
      .exists();
  });

  test('it shows candidate details with action buttons', async function (assert) {
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
    this.set('rejectLiveAlert', sinon.stub());

    // when
    const screen = await renderScreen(hbs`
        <SessionSupervising::HandleLiveAlertModal
          @showModal={{this.isModalDisplayed}}
          @closeConfirmationModal={{this.closeModal}}
          @title={{this.candidateFullName}}
          @rejectLiveAlert={{this.rejectLiveAlert}}
        />
      `);

    // then
    assert.dom(screen.getByText('Jean-Paul Candidat')).exists();
    assert
      .dom(
        screen.getByRole('button', {
          name: this.intl.t(
            'pages.session-supervising.candidate-in-list.handle-live-alert-modal.ask.dismiss-alert-button',
          ),
        }),
      )
      .exists();
    assert
      .dom(
        screen.getByRole('button', {
          name: this.intl.t(
            'pages.session-supervising.candidate-in-list.handle-live-alert-modal.ask.validate-alert-button',
          ),
        }),
      )
      .exists();
  });
});
