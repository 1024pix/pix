import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Steps from 'mon-pix/components/certification-instructions/steps';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | certification-instructions | steps', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('certification name', function () {
    test('displays "Pix" in the title when subscription is CORE', async function (assert) {
      // given
      const candidate = { subscription: 'CORE' };
      const certificationInfo = { assessmentDuration: 155 };

      // when
      const screen = await render(
        <template><Steps @candidate={{candidate}} @certificationInfo={{certificationInfo}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: new RegExp(t('pages.certification-instructions.steps.1.title', { certificationName: 'Pix' })),
          }),
        )
        .exists();
    });

    test('displays "Pix" in the title when subscription is CLEA', async function (assert) {
      // given
      const candidate = { subscription: 'CLEA' };

      const certificationInfo = { assessmentDuration: 155 };

      // when
      const screen = await render(
        <template><Steps @candidate={{candidate}} @certificationInfo={{certificationInfo}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: new RegExp('Bienvenue à la certification Pix'),
          }),
        )
        .exists();
    });

    test('displays the complementary certification name in the title when subscription is a non-core one', async function (assert) {
      // given
      const candidate = { subscription: 'DROIT', hasNonCoreScopeSubscription: true };

      const certificationInfo = { assessmentDuration: 155 };

      // when
      const screen = await render(
        <template><Steps @candidate={{candidate}} @certificationInfo={{certificationInfo}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: new RegExp(
              t('pages.certification-instructions.steps.1.title', {
                certificationName: t('pages.certification-frameworks.DROIT'),
              }).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            ),
          }),
        )
        .exists();
    });
  });

  module('first step paragraph', function () {
    test('displays the default text when subscription has no complementary scope', async function (assert) {
      // given
      const candidate = { subscription: null };

      const certificationInfo = { assessmentDuration: 155 };

      // when
      const screen = await render(
        <template><Steps @candidate={{candidate}} @certificationInfo={{certificationInfo}} /></template>,
      );

      // then
      assert.dom(screen.getByText(/ensemble des 16 compétences numériques du référentiel Pix/)).exists();
    });

    test('displays the default text when subscription is CLEA', async function (assert) {
      // given
      const candidate = { subscription: 'CLEA' };

      const certificationInfo = { assessmentDuration: 155 };

      // when
      const screen = await render(
        <template><Steps @candidate={{candidate}} @certificationInfo={{certificationInfo}} /></template>,
      );

      // then
      assert.dom(screen.getByText(/ensemble des 16 compétences numériques du référentiel Pix/)).exists();
    });

    test('displays the Pix+ specific text when subscription has a complementary scope', async function (assert) {
      // given
      const candidate = { subscription: 'DROIT', hasNonCoreScopeSubscription: true };

      const certificationInfo = { assessmentDuration: 155 };

      // when
      const screen = await render(
        <template><Steps @candidate={{candidate}} @certificationInfo={{certificationInfo}} /></template>,
      );

      // then
      assert.dom(screen.getByText(/ensemble des compétences du référentiel de certification Pix\+ Droit/)).exists();
    });
  });

  module('certification duration', function () {
    test('displays "1 H 45 min" / "1h45" for a standard Pix certification', async function (assert) {
      // given
      const candidate = { subscription: null };

      const certificationInfo = { assessmentDuration: 155 };

      // when
      const screen = await render(
        <template><Steps @candidate={{candidate}} @certificationInfo={{certificationInfo}} /></template>,
      );

      await click(
        screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') }),
      );

      // then
      assert.dom(screen.getByText('2 H 35 min')).exists();
      assert.dom(screen.getByText(/2h35/)).exists();
    });

    test('displays "1 H" / "1h" for a Pix+ Droit certification', async function (assert) {
      // given
      const candidate = { subscription: 'DROIT' };

      const certificationInfo = { assessmentDuration: 60 };

      // when
      const screen = await render(
        <template><Steps @candidate={{candidate}} @certificationInfo={{certificationInfo}} /></template>,
      );

      await click(
        screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') }),
      );

      // then
      assert.dom(screen.getByText('1 H')).exists();
      assert.dom(screen.getByText(/1h/)).exists();
    });

    test('displays "1 H 30 min" / "1h30" for a Pix+ Édu certification', async function (assert) {
      // given
      const candidate = { subscription: 'EDU_1ER_DEGRE' };

      const certificationInfo = { assessmentDuration: 90 };

      // when
      const screen = await render(
        <template><Steps @candidate={{candidate}} @certificationInfo={{certificationInfo}} /></template>,
      );

      await click(
        screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') }),
      );

      // then
      assert.dom(screen.getByText('1 H 30 min')).exists();
      assert.dom(screen.getByText(/1h30/)).exists();
    });
  });

  module('navigation', function () {
    test('advances to the next step when clicking the continue button', async function (assert) {
      // given
      const candidate = { subscription: null };

      const certificationInfo = { assessmentDuration: 155, maximumAssessmentLength: 45, minimumAssessmentLength: 25 };

      // when
      const screen = await render(
        <template><Steps @candidate={{candidate}} @certificationInfo={{certificationInfo}} /></template>,
      );

      assert.dom(screen.getByText(t('pages.certification-instructions.steps.1.question'))).exists();
      await click(
        screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') }),
      );

      // then
      assert
        .dom(
          screen.getByText(
            t('pages.certification-instructions.steps.2.legend.strong-text', { maximumAssessmentLength: 45 }),
          ),
        )
        .exists();
      assert.dom(screen.queryByText(t('pages.certification-instructions.steps.1.question'))).doesNotExist();
    });

    test('saves the candidate and redirects to the certification starter on the last step when the checkbox is checked', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'transitionTo');
      const save = sinon.stub().resolves();
      const candidate = { subscription: null, id: '123', save };

      const certificationInfo = { assessmentDuration: 155, maximumAssessmentLength: 45, minimumAssessmentLength: 45 };

      // when
      const screen = await render(
        <template><Steps @candidate={{candidate}} @certificationInfo={{certificationInfo}} /></template>,
      );

      const continueButton = () =>
        screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') });

      await click(continueButton());
      await new Promise((resolve) => setTimeout(resolve, 500));
      await click(continueButton());
      await new Promise((resolve) => setTimeout(resolve, 500));
      await click(continueButton());
      await new Promise((resolve) => setTimeout(resolve, 500));
      await click(continueButton());

      // checkbox is on the last step
      await click(screen.getByRole('checkbox', { name: t('pages.certification-instructions.steps.5.checkbox-label') }));
      await click(
        screen.getByRole('button', {
          name: t('pages.certification-instructions.buttons.continuous.last-page.aria-label'),
        }),
      );

      // then
      assert.ok(
        save.calledWith({
          adapterOptions: { hasSeenCertificationInstructions: true },
        }),
      );
      assert.ok(routerService.transitionTo.calledWith('authenticated.certifications.start', '123'));
    });
  });
});
