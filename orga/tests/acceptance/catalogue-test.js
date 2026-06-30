import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { within } from '@testing-library/dom';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import { createPrescriberByUser, createUserManagingStudents } from '../helpers/test-init';

module('Acceptance | Catalogue page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let course1, course2;

  hooks.beforeEach(async function () {
    const user = createUserManagingStudents('ADMIN');
    createPrescriberByUser({ user });
    await authenticateSession(user.id);
    server.create('feature-toggle', { id: '0', displayCatalogue: true });
    course1 = server.create('course', {
      id: 1,
      name: 'Ma super formation',
      type: 'targetProfile',
      nbTubes: 5,
      category: 'PREDEFINED',
    });
    server.create('target-profile-overview', {
      id: 1,
      name: 'Ma super formation',
      isSimplifiedAccess: false,
      category: 'PREDEFINED',
    });
    course2 = server.create('course', { id: 2, name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2 });
    server.create('combined-course-blueprint-overview', {
      id: 2,
      name: 'Mon parcours combiné',
    });
  });

  test('it should display catalogue page', async function (assert) {
    // when
    const screen = await visit(`/catalogue`);
    // then
    assert.ok(screen.getByRole('heading', { name: t('pages.catalogue.title') }));
    assert.ok(screen.getByRole('heading', { name: course1.name }));
    assert.ok(screen.getByRole('heading', { name: course2.name }));
  });

  test('it should display target profile course dialog when clicking on a card', async function (assert) {
    // when
    const screen = await visit(`/catalogue`);
    // then
    await click(screen.getByRole('link', { name: t('pages.catalogue.modal.open-modal', { name: course1.name }) }));
    const dialog = await screen.findByRole('dialog');
    assert.ok(within(dialog).getByRole('heading', { name: course1.name }));
  });

  test('it should display combined course blueprint course dialog when clicking on a card', async function (assert) {
    // when
    const screen = await visit(`/catalogue`);
    // then
    await click(screen.getByRole('link', { name: t('pages.catalogue.modal.open-modal', { name: course2.name }) }));
    const dialog = await screen.findByRole('dialog');
    assert.ok(within(dialog).getByRole('heading', { name: course2.name }));
  });
});
