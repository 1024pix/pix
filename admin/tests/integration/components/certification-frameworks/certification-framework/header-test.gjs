import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import Header from 'pix-admin/components/certification-frameworks/certification-framework/header';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | certification-frameworks/certification-framework/header', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');

    class routerStub extends Service {
      currentRouteName = 'super.route';
    }
    this.owner.register('service:router', routerStub);
  });

  test('it should display the framework label in breadcrumb and title', async function (assert) {
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: false };
    const certificationFramework = store.createRecord('certification-framework', { id: 'DROIT', name: 'DROIT' });
    // when
    const screen = await render(<template><Header @certificationFramework={{certificationFramework}} /></template>);

    // then
    assert.ok(screen.getByRole('heading', { name: t('components.certification-frameworks.labels.DROIT'), level: 1 }));
  });

  test('it should display create button when there is no draft version', async function (assert) {
    const certificationFramework = store.createRecord('certification-framework', { id: 'DROIT', name: 'DROIT' });

    const frameworkHistory = store.createRecord('framework-history', { history: [] });

    // when
    const screen = await render(
      <template>
        <Header @certificationFramework={{certificationFramework}} @frameworkHistory={{frameworkHistory}} />
      </template>,
    );

    const button = screen.getByText(t('components.certification-frameworks.certification-framework.create-button'));
    // then
    assert.strictEqual(button.getAttribute('aria-disabled'), 'false');
  });

  test('it should disable the create button when there is a draft version', async function (assert) {
    // given
    this.owner.lookup('service:router');
    const certificationFramework = store.createRecord('certification-framework', { id: 'DROIT', name: 'DROIT' });

    const frameworkItem1 = {
      id: 456,
      startDate: new Date('2023-10-10'),
      expirationDate: null,
      assessmentDuration: 90,
      maximumAssessmentLength: 32,
      status: 'ACTIVE',
    };

    const frameworkItem2 = {
      id: 123,
      startDate: new Date('2020-01-01'),
      expirationDate: new Date('2021-06-15'),
      assessmentDuration: 105,
      maximumAssessmentLength: 32,
      status: 'ARCHIVED',
    };
    const frameworkItem3 = {
      id: 999,
      startDate: null,
      expirationDate: null,
      assessmentDuration: 90,
      maximumAssessmentLength: 32,
      status: 'DRAFT',
    };

    const frameworkHistory = store.createRecord('framework-history', {
      history: [frameworkItem1, frameworkItem2, frameworkItem3],
    });

    // when
    const screen = await render(
      <template>
        <Header @certificationFramework={{certificationFramework}} @frameworkHistory={{frameworkHistory}} />
      </template>,
    );

    const button = screen.getByText(t('components.certification-frameworks.certification-framework.create-button'));
    // then
    assert.strictEqual(button.getAttribute('aria-disabled'), 'true');

    await triggerEvent(button, 'mouseenter');
    assert
      .dom(
        screen.getByText(t('components.certification-frameworks.certification-framework.create-button-cancel-tooltip')),
      )
      .exists();
  });
});
