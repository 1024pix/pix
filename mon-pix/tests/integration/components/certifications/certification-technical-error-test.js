import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import { stubCurrentUserService } from '../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | CertificationTechnicalError', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the current user name', async function (assert) {
    // given
    stubCurrentUserService(this.owner, { firstName: 'Jim', lastName: 'Halpert' });

    // when
    const screen = await renderScreen(hbs`<Certifications::CertificationTechnicalError />`);

    // then
    assert.ok(screen.getByText('Jim Halpert'));
  });

  test('should display the certification number', async function (assert) {
    // given
    this.certificationNumber = 1234;

    // when
    const screen = await renderScreen(
      hbs`<Certifications::CertificationTechnicalError @certificationNumber={{this.certificationNumber}} />`,
    );

    // then
    assert.ok(screen.getByText(1234));
  });

  test('should display the candidate title and message', async function (assert) {
    // when
    const screen = await renderScreen(hbs`<Certifications::CertificationTechnicalError />`);

    // then
    assert.ok(screen.getByText(t('pages.certification-technical-error.candidate.title')));
    assert.ok(screen.getByText(t('pages.certification-technical-error.candidate.message')));
  });

  module('when @isToBeCancelled is true', function () {
    test('should display the cancelled message', async function (assert) {
      // when
      const screen = await renderScreen(
        hbs`<Certifications::CertificationTechnicalError @isToBeCancelled={{true}} />`,
      );

      // then
      assert.ok(screen.getByText(t('pages.certification-technical-error.candidate.cancelled')));
    });

    test('should not display the results block', async function (assert) {
      // when
      const screen = await renderScreen(
        hbs`<Certifications::CertificationTechnicalError @isToBeCancelled={{true}} />`,
      );

      // then
      assert.dom(screen.queryByText(t('pages.certification-ender.results.disclaimer'))).doesNotExist();
    });
  });

  module('when @isToBeCancelled is false', function () {
    test('should display the results block', async function (assert) {
      // when
      const screen = await renderScreen(
        hbs`<Certifications::CertificationTechnicalError @isToBeCancelled={{false}} />`,
      );

      // then
      assert.ok(screen.getByText(t('pages.certification-ender.results.disclaimer')));
    });

    test('should not display the cancelled message', async function (assert) {
      // when
      const screen = await renderScreen(
        hbs`<Certifications::CertificationTechnicalError @isToBeCancelled={{false}} />`,
      );

      // then
      assert.dom(screen.queryByText(t('pages.certification-technical-error.candidate.cancelled'))).doesNotExist();
    });
  });
});
