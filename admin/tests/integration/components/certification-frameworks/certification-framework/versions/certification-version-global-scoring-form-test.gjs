import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import CertificationVersionScoringForm from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-global-scoring-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

const SUBMIT_BUTTON_LABEL =
  'components.certification-frameworks.certification-framework.versions.scoring.capacity-submit-button';
const LEVEL_KEY = 'components.certification-frameworks.certification-framework.versions.scoring.level';
const CAPACITY_LABEL =
  'components.certification-frameworks.certification-framework.versions.scoring.previous-version-capacity';

// Both bounds share the same label key, so they can only be told apart by DOM order:
// each mesh level renders its min input first, then its max input.
function getBoundsInputs(screen) {
  const inputs = screen.getAllByRole('spinbutton');
  return {
    min: inputs.filter((_input, index) => index % 2 === 0),
    max: inputs.filter((_input, index) => index % 2 === 1),
  };
}

function labelOf(input) {
  return input.labels[0];
}

function createCalibrationProposal(store, globalScoringConfiguration) {
  return store.createRecord('calibration-scoring-configuration', {
    id: '5',
    calibrationId: 5,
    globalScoringConfiguration: globalScoringConfiguration ?? [{ bounds: { min: -4.67, max: -1.4 }, meshLevel: 0 }],
  });
}

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
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        // when
        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
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
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        // when
        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // then
        const { min: minInputs, max: maxInputs } = getBoundsInputs(screen);

        assert.dom(minInputs[0]).hasValue('1');
        assert.dom(maxInputs[0]).hasValue('8');
        assert.dom(minInputs[1]).hasValue('8');
        assert.dom(maxInputs[1]).hasValue('15');
      });

      test('it labels each input with the capacity of the active version', async function (assert) {
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
        const activeVersion = store.createRecord('certification-version', {
          id: '2',
          status: 'active',
          globalScoringConfiguration: [
            { bounds: { min: 2, max: 9 }, meshLevel: 0 },
            { bounds: { min: 9, max: 16 }, meshLevel: 1 },
          ],
        });
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        // when
        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @activeVersion={{activeVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // then
        const { min: minInputs, max: maxInputs } = getBoundsInputs(screen);

        assert.dom(labelOf(minInputs[0])).includesText(t(CAPACITY_LABEL, { previousVersionCapacity: 2 }));
        assert.dom(labelOf(maxInputs[0])).includesText(t(CAPACITY_LABEL, { previousVersionCapacity: 9 }));
        assert.dom(labelOf(minInputs[1])).includesText(t(CAPACITY_LABEL, { previousVersionCapacity: 9 }));
        assert.dom(labelOf(maxInputs[1])).includesText(t(CAPACITY_LABEL, { previousVersionCapacity: 16 }));
      });

      test('it falls back to a dash when there is no active version to compare with', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          globalScoringConfiguration: [{ bounds: { min: 1, max: 8 }, meshLevel: 0 }],
        });
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        // when
        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // then
        const { min: minInputs } = getBoundsInputs(screen);
        assert.dom(labelOf(minInputs[0])).includesText(t(CAPACITY_LABEL, { previousVersionCapacity: '—' }));
      });

      test('it displays the bounds proposed by the calibration when the draft has none', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          externalCalibrationId: 5,
          globalScoringConfiguration: [],
        });
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        // when
        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // then
        const { min: minInputs, max: maxInputs } = getBoundsInputs(screen);
        assert.dom(minInputs[0]).hasValue('-4.67');
        assert.dom(maxInputs[0]).hasValue('-1.4');
      });

      test('it keeps the bounds saved on the draft over the ones proposed by the calibration', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = store.createRecord('certification-version', {
          id: '1',
          status: 'draft',
          externalCalibrationId: 5,
          globalScoringConfiguration: [{ bounds: { min: 1, max: 8 }, meshLevel: 0 }],
        });
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        // when
        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // then
        const { min: minInputs } = getBoundsInputs(screen);
        assert.dom(minInputs[0]).hasValue('1');
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
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        // when
        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
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
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        // when
        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
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
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        // when
        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
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
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        // when
        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // then
        assert
          .dom(
            screen.getByText(
              t('components.certification-frameworks.certification-framework.versions.scoring.cannot-be-lower-error'),
            ),
          )
          .exists();
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
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // when
        await fillIn(getBoundsInputs(screen).max[0], '10');

        // then
        assert.dom(getBoundsInputs(screen).min[1]).hasValue('10');
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
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: t(SUBMIT_BUTTON_LABEL) }));

        // then
        assert.ok(
          pixToast.sendSuccessNotification.calledOnceWith({
            message: t(
              'components.certification-frameworks.certification-framework.versions.scoring.success-notification',
            ),
          }),
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
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: t(SUBMIT_BUTTON_LABEL) }));

        // then
        assert.ok(pixToast.sendErrorNotification.calledOnceWith({ message: 'Erreur serveur' }));
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
        const calibrationScoringConfiguration = createCalibrationProposal(store);

        const screen = await render(
          <template>
            <CertificationVersionScoringForm
              @draftVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: t(SUBMIT_BUTTON_LABEL) }));

        // then
        assert.ok(draftVersion.save.notCalled);
      });
    });
  },
);
