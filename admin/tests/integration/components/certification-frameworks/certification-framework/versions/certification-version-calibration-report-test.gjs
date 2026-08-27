import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import CertificationVersionCalibrationReport from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-calibration-report';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

const I18N_PREFIX = 'components.certification-frameworks.certification-framework.versions.calibration';

const CHALLENGE_COUNT_LINE = {
  label: 'CALIBRATED_CHALLENGE_COUNT',
  content: 15,
  alertLevel: null,
  additionalContent: null,
};

const HIGH_ALERT_LINE = {
  label: 'CALIBRATION_STATUS',
  content: 'TO_VALIDATE',
  alertLevel: 'HIGH',
  additionalContent: 'La calibration ne semble pas encore finalisée',
};

function showAdditionalInfoLabel(lineNumber) {
  return t(`${I18N_PREFIX}.show-additional-info`, { lineNumber });
}

module(
  'Integration | Component | certification-frameworks/certification-framework/versions/certification-version-calibration-report',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    let store, pixToast;

    hooks.beforeEach(function () {
      store = this.owner.lookup('service:store');
      pixToast = this.owner.lookup('service:pixToast');
      sinon.stub(pixToast, 'sendSuccessNotification');
      sinon.stub(pixToast, 'sendErrorNotification');
    });

    function createDraftVersion({ externalCalibrationId = null } = {}) {
      const draftVersion = store.createRecord('certification-version', {
        id: '14',
        status: 'draft',
        externalCalibrationId,
      });
      sinon.stub(draftVersion, 'save').resolves();
      return draftVersion;
    }

    function createReport(reportLines) {
      return store.createRecord('calibration-report', {
        id: '999',
        calibrationId: 1,
        generatedAt: new Date('2026-08-08T14:00:00Z'),
        reportLines,
      });
    }

    module('when no report could be retrieved', function () {
      test('it displays a message instead of the report', async function (assert) {
        // given
        const draftVersion = createDraftVersion();

        // when
        const screen = await render(
          <template><CertificationVersionCalibrationReport @draftVersion={{draftVersion}} /></template>,
        );

        // then
        assert.dom(screen.getByText(t(`${I18N_PREFIX}.no-report-message`))).exists();
        assert.dom(screen.queryByText(t(`${I18N_PREFIX}.label-for-CALIBRATED_CHALLENGE_COUNT`))).doesNotExist();
      });
    });

    module('report lines', function () {
      test('it translates the label and the content of each line', async function (assert) {
        // given
        const draftVersion = createDraftVersion();
        const calibrationReport = createReport([
          CHALLENGE_COUNT_LINE,
          { label: 'CALIBRATION_SCOPE', content: 'CORE', alertLevel: null, additionalContent: null },
          { label: 'CALIBRATION_STATUS', content: 'VALIDATED', alertLevel: null, additionalContent: null },
          { label: 'MESH_SCORING_PRESENCE', content: true, alertLevel: null, additionalContent: null },
          { label: 'COMPETENCE_SCORING_PRESENCE', content: false, alertLevel: null, additionalContent: null },
        ]);

        // when
        const screen = await render(
          <template>
            <CertificationVersionCalibrationReport
              @draftVersion={{draftVersion}}
              @calibrationReport={{calibrationReport}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText(t(`${I18N_PREFIX}.label-for-CALIBRATION_SCOPE`))).exists();
        assert.dom(screen.getByText(t(`${I18N_PREFIX}.scopes.CORE`))).exists();
        assert.dom(screen.getByText(t(`${I18N_PREFIX}.statuses.VALIDATED`))).exists();
        assert.dom(screen.getByText(t('common.words.yes'))).exists();
        assert.dom(screen.getByText(t('common.words.no'))).exists();
      });

      test('it displays no alert icon on a line without alert', async function (assert) {
        // given
        const draftVersion = createDraftVersion();
        const calibrationReport = createReport([CHALLENGE_COUNT_LINE]);

        // when
        const screen = await render(
          <template>
            <CertificationVersionCalibrationReport
              @draftVersion={{draftVersion}}
              @calibrationReport={{calibrationReport}}
            />
          </template>,
        );

        // then
        assert.dom(screen.queryByRole('button', { name: showAdditionalInfoLabel(1) })).doesNotExist();
      });

      test('it toggles the additional content of an alerted line', async function (assert) {
        // given
        const draftVersion = createDraftVersion();
        const calibrationReport = createReport([
          {
            label: 'TUBE_ONLY_IN_VERSION_COUNT',
            content: 1,
            alertLevel: 'LOW',
            additionalContent: 'tubeA',
          },
        ]);

        // when
        const screen = await render(
          <template>
            <CertificationVersionCalibrationReport
              @draftVersion={{draftVersion}}
              @calibrationReport={{calibrationReport}}
            />
          </template>,
        );

        // then
        assert.dom(screen.queryByText('tubeA')).doesNotExist();

        await click(screen.getByRole('button', { name: showAdditionalInfoLabel(1) }));
        assert.dom(screen.getByText('tubeA')).exists();

        await click(screen.getByRole('button', { name: showAdditionalInfoLabel(1) }));
        assert.dom(screen.queryByText('tubeA')).doesNotExist();
      });
    });

    module('validation button', function () {
      test('it saves the calibrationId of the report on the version', async function (assert) {
        // given
        const draftVersion = createDraftVersion();
        const calibrationReport = createReport([CHALLENGE_COUNT_LINE]);

        // when
        const screen = await render(
          <template>
            <CertificationVersionCalibrationReport
              @draftVersion={{draftVersion}}
              @calibrationReport={{calibrationReport}}
            />
          </template>,
        );
        await click(screen.getByRole('button', { name: t(`${I18N_PREFIX}.save-button-label`, { id: 1 }) }));

        // then
        assert.strictEqual(draftVersion.externalCalibrationId, 1);
        assert.true(draftVersion.save.calledOnce);
        assert.true(pixToast.sendSuccessNotification.calledOnce);
      });

      test('it is disabled when the report holds a high alert', async function (assert) {
        // given
        const draftVersion = createDraftVersion();
        const calibrationReport = createReport([CHALLENGE_COUNT_LINE, HIGH_ALERT_LINE]);

        // when
        const screen = await render(
          <template>
            <CertificationVersionCalibrationReport
              @draftVersion={{draftVersion}}
              @calibrationReport={{calibrationReport}}
            />
          </template>,
        );

        // then
        assert
          .dom(screen.getByRole('button', { name: t(`${I18N_PREFIX}.save-button-label`, { id: 1 }) }))
          .hasAttribute('aria-disabled');
      });

      test('it explains in a tooltip why it is disabled when already saved', async function (assert) {
        // given
        const draftVersion = createDraftVersion({ externalCalibrationId: 1 });
        const calibrationReport = createReport([CHALLENGE_COUNT_LINE]);

        // when
        const screen = await render(
          <template>
            <CertificationVersionCalibrationReport
              @draftVersion={{draftVersion}}
              @calibrationReport={{calibrationReport}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText(t(`${I18N_PREFIX}.save-button-already-saved-tooltip`, { id: 1 }))).exists();
      });

      test('it explains in a tooltip why it is disabled on a high alert', async function (assert) {
        // given
        const draftVersion = createDraftVersion();
        const calibrationReport = createReport([CHALLENGE_COUNT_LINE, HIGH_ALERT_LINE]);

        // when
        const screen = await render(
          <template>
            <CertificationVersionCalibrationReport
              @draftVersion={{draftVersion}}
              @calibrationReport={{calibrationReport}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText(t(`${I18N_PREFIX}.save-button-high-alert-tooltip`))).exists();
      });

      test('it holds no tooltip when the validation is possible', async function (assert) {
        // given
        const draftVersion = createDraftVersion();
        const calibrationReport = createReport([CHALLENGE_COUNT_LINE]);

        // when
        const screen = await render(
          <template>
            <CertificationVersionCalibrationReport
              @draftVersion={{draftVersion}}
              @calibrationReport={{calibrationReport}}
            />
          </template>,
        );

        // then
        assert.dom(screen.queryByText(t(`${I18N_PREFIX}.save-button-already-saved-tooltip`, { id: 1 }))).doesNotExist();
        assert.dom(screen.queryByText(t(`${I18N_PREFIX}.save-button-high-alert-tooltip`))).doesNotExist();
      });

      test('it is disabled when the calibrationId is already saved on the version', async function (assert) {
        // given
        const draftVersion = createDraftVersion({ externalCalibrationId: 1 });
        const calibrationReport = createReport([CHALLENGE_COUNT_LINE]);

        // when
        const screen = await render(
          <template>
            <CertificationVersionCalibrationReport
              @draftVersion={{draftVersion}}
              @calibrationReport={{calibrationReport}}
            />
          </template>,
        );

        // then
        assert
          .dom(screen.getByRole('button', { name: t(`${I18N_PREFIX}.save-button-label`, { id: 1 }) }))
          .hasAttribute('aria-disabled');
      });
    });
  },
);
