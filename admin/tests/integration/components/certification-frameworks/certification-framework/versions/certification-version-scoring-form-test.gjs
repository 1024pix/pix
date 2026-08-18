import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import CertificationVersionScoringForm from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-scoring-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

const SUBMIT_BUTTON_LABEL =
  'components.certification-frameworks.certification-framework.versions.scoring.capacity-submit-button';
const LEVEL_KEY = 'components.certification-frameworks.certification-framework.versions.scoring.level';
const MIN_LABEL = 'components.certification-frameworks.certification-framework.versions.scoring.minimum-input-label';
const MAX_LABEL = 'components.certification-frameworks.certification-framework.versions.scoring.maximum-input-label';

module(
  'Integration | Component | certification-frameworks/certification-framework/versions/certification-version-scoring-form',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    let pixToast;

    hooks.beforeEach(function () {
      pixToast = this.owner.lookup('service:pixToast');
      sinon.stub(pixToast, 'sendSuccessNotification');
      sinon.stub(pixToast, 'sendErrorNotification');
    });

    module('levels display', function () {
      test('it renders one section per mesh level', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          globalScoringConfiguration: [
            { bounds: { min: 1, max: 8 }, meshLevel: 0 },
            { bounds: { min: 8, max: 15 }, meshLevel: 1 },
          ],
        });

        // when
        const screen = await render(
          <template><CertificationVersionScoringForm @draftVersion={{draftVersion}} /></template>,
        );

        // then
        assert.dom(screen.getByText(t(LEVEL_KEY, { index: 0 }))).exists();
        assert.dom(screen.getByText(t(LEVEL_KEY, { index: 1 }))).exists();
        assert.dom(screen.queryByText(t(LEVEL_KEY, { index: 2 }))).doesNotExist();
      });

      test('it pre-fills inputs with model data', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          globalScoringConfiguration: [
            { bounds: { min: 1, max: 8 }, meshLevel: 0 },
            { bounds: { min: 8, max: 15 }, meshLevel: 1 },
          ],
        });

        // when
        const screen = await render(
          <template><CertificationVersionScoringForm @draftVersion={{draftVersion}} /></template>,
        );

        // then
        const minInputs = screen.getAllByLabelText(t(MIN_LABEL), { exact: false });
      const maxInputs = screen.getAllByLabelText(t(MAX_LABEL), { exact: false });

        assert.dom(minInputs[0]).hasValue('1');
        assert.dom(maxInputs[0]).hasValue('8');
        assert.dom(minInputs[1]).hasValue('8');
        assert.dom(maxInputs[1]).hasValue('15');
      });
    });

    module('submit button state', function () {
      test('it enables the submit button when all bounds are valid', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          globalScoringConfiguration: [{ bounds: { min: 1, max: 8 }, meshLevel: 0 }],
        });

        // when
        const screen = await render(
          <template><CertificationVersionScoringForm @draftVersion={{draftVersion}} /></template>,
        );

        // then
        assert.dom(screen.getByRole('button', { name: t(SUBMIT_BUTTON_LABEL) })).doesNotHaveAttribute('aria-disabled');
      });

      test('it disables the submit button when max is lower than min on page load', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          globalScoringConfiguration: [{ bounds: { min: 5, max: 2 }, meshLevel: 0 }],
        });

        // when
        const screen = await render(
          <template><CertificationVersionScoringForm @draftVersion={{draftVersion}} /></template>,
        );

        // then
        assert.dom(screen.getByRole('button', { name: t(SUBMIT_BUTTON_LABEL) })).hasAttribute('aria-disabled');
      });

      test('it disables the submit button when max equals min on page load', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          globalScoringConfiguration: [{ bounds: { min: 3, max: 3 }, meshLevel: 0 }],
        });

        // when
        const screen = await render(
          <template><CertificationVersionScoringForm @draftVersion={{draftVersion}} /></template>,
        );

        // then
        assert.dom(screen.getByRole('button', { name: t(SUBMIT_BUTTON_LABEL) })).hasAttribute('aria-disabled');
      });
    });

    module('error message', function () {
      test('it displays an error message when max is lower than min on page load', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          globalScoringConfiguration: [{ bounds: { min: 5, max: 2 }, meshLevel: 0 }],
        });

        // when
        const screen = await render(
          <template><CertificationVersionScoringForm @draftVersion={{draftVersion}} /></template>,
        );

        // then
        assert.dom(screen.getByText(t('components.certification-frameworks.certification-framework.versions.scoring.cannot-be-lower-error'))).exists();
      });
    });

    module('cascade update', function () {
      test('it updates the min of the next level when the max of a level changes', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          globalScoringConfiguration: [
            { bounds: { min: 1, max: 8 }, meshLevel: 0 },
            { bounds: { min: 8, max: 15 }, meshLevel: 1 },
          ],
        });

        const screen = await render(
          <template><CertificationVersionScoringForm @draftVersion={{draftVersion}} /></template>,
        );

        // when
        const maxInputs = screen.getAllByLabelText(t(MAX_LABEL), { exact: false });
        await fillIn(maxInputs[0], '10');

        // then
        const minInputs = screen.getAllByLabelText(t(MIN_LABEL), { exact: false });
        assert.dom(minInputs[1]).hasValue('10');
      });
    });

    module('save notifications', function () {
      test('it shows a success notification when save succeeds', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          globalScoringConfiguration: [{ bounds: { min: 1, max: 8 }, meshLevel: 0 }],
        });
        sinon.stub(draftVersion, 'save').resolves();

        const screen = await render(
          <template><CertificationVersionScoringForm @draftVersion={{draftVersion}} /></template>,
        );

        // when
        await click(screen.getByRole('button', { name: t(SUBMIT_BUTTON_LABEL) }));

        // then
        assert.ok(
          pixToast.sendSuccessNotification.calledOnceWith({ message: t('components.certification-frameworks.certification-framework.versions.scoring.success-notification') }),
        );
      });

      test('it shows an error notification when save fails', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          globalScoringConfiguration: [{ bounds: { min: 1, max: 8 }, meshLevel: 0 }],
        });
        sinon.stub(draftVersion, 'save').rejects({ errors: [{ detail: 'Erreur serveur' }] });

        const screen = await render(
          <template><CertificationVersionScoringForm @draftVersion={{draftVersion}} /></template>,
        );

        // when
        await click(screen.getByRole('button', { name: t(SUBMIT_BUTTON_LABEL) }));

        // then
        assert.ok(
          pixToast.sendErrorNotification.calledOnceWith({ message: 'Erreur serveur' }),
        );
      });

      test('it does not save when bounds are invalid', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          globalScoringConfiguration: [{ bounds: { min: 5, max: 2 }, meshLevel: 0 }],
        });
        sinon.stub(draftVersion, 'save').resolves();

        const screen = await render(
          <template><CertificationVersionScoringForm @draftVersion={{draftVersion}} /></template>,
        );

        // when
        await click(screen.getByRole('button', { name: t(SUBMIT_BUTTON_LABEL) }));

        // then
        assert.ok(draftVersion.save.notCalled);
      });
    });
  },
);
