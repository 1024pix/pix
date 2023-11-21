import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { render as renderScreen } from '@1024pix/ember-testing-library';

const mainSubcategoriesTranslationKeys = [
  'accessibility-issue',
  'extra-time-exceeded',
  'skip-on-oops',
  'software-not-working',
  'website-blocked',
  'website-unavailable',
];

module('Integration | Component | handle-live-alert-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  [
    {
      hasAttachment: true,
      hasImage: false,
      hasEmbed: false,
      isFocus: false,
      translationKeys: ['file-not-opening', ...mainSubcategoriesTranslationKeys],
      numberOfRadioButtons: 7,
    },
    {
      hasAttachment: false,
      hasImage: true,
      hasEmbed: false,
      isFocus: false,
      translationKeys: ['image-not-displaying', ...mainSubcategoriesTranslationKeys],
      numberOfRadioButtons: 7,
    },
    {
      hasAttachment: false,
      hasImage: false,
      hasEmbed: true,
      isFocus: false,
      translationKeys: ['embed-not-working', ...mainSubcategoriesTranslationKeys],
      numberOfRadioButtons: 7,
    },
    {
      hasAttachment: false,
      hasImage: false,
      hasEmbed: false,
      isFocus: true,
      translationKeys: ['unintentional-focus-out', ...mainSubcategoriesTranslationKeys],
      numberOfRadioButtons: 7,
    },
    {
      hasAttachment: false,
      hasImage: false,
      hasEmbed: false,
      isFocus: false,
      translationKeys: [...mainSubcategoriesTranslationKeys],
      numberOfRadioButtons: 6,
    },
  ].forEach(({ hasEmbed, hasImage, hasAttachment, isFocus, numberOfRadioButtons, translationKeys }) => {
    test('it shows issue report reasons depending on challenge typology', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const candidate = store.createRecord('certification-candidate');

      this.set('isModalDisplayed', sinon.stub());
      this.set('closeModal', sinon.stub());
      this.set('candidateFullName', `${candidate.firstName} ${candidate.lastName}`);
      this.set('rejectLiveAlert', sinon.stub());
      this.set('liveAlert', {
        status: 'ongoing',
        hasAttachment,
        hasEmbed,
        isFocus,
        hasImage,
      });

      // when
      const screen = await renderScreen(hbs`
        <SessionSupervising::HandleLiveAlertModal
          @showModal={{this.isModalDisplayed}}
          @closeConfirmationModal={{this.closeModal}}
          @title={{this.candidateFullName}}
          @rejectLiveAlert={{this.rejectLiveAlert}}
          @liveAlert={{this.liveAlert}}
        />
      `);

      // then
      const radioButtons = screen.getAllByRole('radio');
      assert.strictEqual(radioButtons.length, numberOfRadioButtons);
      translationKeys.forEach((key) =>
        assert
          .dom(screen.getByText(this.intl.t(`pages.session-finalization.add-issue-modal.subcategory-labels.${key}`)))
          .exists(),
      );
    });
  });

  test('it shows candidate details with action buttons', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const candidate = store.createRecord('certification-candidate', {
      firstName: 'Jean-Paul',
      lastName: 'Candidat',
      liveAlert: {
        status: 'ongoing',
      },
    });

    this.set('isModalDisplayed', sinon.stub());
    this.set('closeModal', sinon.stub());
    this.set('candidateFullName', `${candidate.firstName} ${candidate.lastName}`);
    this.set('rejectLiveAlert', sinon.stub());
    this.set('liveAlert', { status: 'ongoing' });

    // when
    const screen = await renderScreen(hbs`
        <SessionSupervising::HandleLiveAlertModal
          @showModal={{this.isModalDisplayed}}
          @closeConfirmationModal={{this.closeModal}}
          @title={{this.candidateFullName}}
          @rejectLiveAlert={{this.rejectLiveAlert}}
          @liveAlert={{this.liveAlert}}
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
