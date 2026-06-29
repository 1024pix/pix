import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl from '../../../helpers/setup-intl';

module('Acceptance | Combined course blueprint | Update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    server.create('country', { code: '99100', name: 'France' });
    server.create('attestation', {
      templateName: 'parentalite',
      key: 'PARENTHOOD',
      file: 'parentalite.pdf',
      label: 'Parentalite',
    });
    server.create('combined-course-blueprint', {
      id: 123,
      internalName: 'internal-name',
      attestationLabel: 'attestation',
      rewardRequirements: 'oldRewardRequirements',
    });

    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  test('it should unload record when the user does not submit the data', async function (assert) {
    //given
    const screen = await visit('/combined-course-blueprints/123/edit');

    //when
    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.internal-name'), { exact: false }),
      'newInternalName',
    );
    await click(screen.getByRole('link', { name: t('components.layout.sidebar.combined-course-blueprints') }));

    //then
    assert.ok(screen.getByText('internal-name'));
  });

  test('it should redirect to list after updating successfully', async function (assert) {
    // when
    const screen = await visit('/combined-course-blueprints/123/edit');

    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.name'), { exact: false }),
      'name',
    );
    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.internal-name'), { exact: false }),
      'newInternalName',
    );

    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.illustration')),
      'illustrations/hello.svg',
    );

    await fillIn(screen.getByLabelText(t('components.combined-course-blueprints.labels.description')), 'description');
    await fillIn(
      screen.getByRole('textbox', { name: t('components.combined-course-blueprints.labels.reward-requirements') }),
      'New reward requirements',
    );

    await click(screen.getByRole('button', { name: t('components.combined-course-blueprints.update.updateButton') }));

    // then
    assert.strictEqual(currentURL(), '/combined-course-blueprints/list');
    assert.ok(screen.getByText('newInternalName'));
  });
});
