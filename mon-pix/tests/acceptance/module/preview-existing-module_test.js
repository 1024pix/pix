import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Module | Routes | Preview Existing Module', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('should allow to preview existing module', async function (assert) {
    // given
    server.create('module', {
      id: 'existing-module',
      shortId: 's0l31l',
      slug: 'existing-module',
      title: 'Existing Module',
      isBeta: true,
      grains: [],
      details: {},
    });

    // when
    const screen = await visit('/modules/preview/s0l31l/existing-module');

    // then
    assert.strictEqual(currentURL(), '/modules/preview/s0l31l/existing-module');
    assert.dom(screen.getByRole('heading', { name: 'Existing Module' })).exists();
  });

  test('should redirect to correct url when slug is not correct', async function (assert) {
    // given
    server.create('module', {
      id: 'existing-module',
      shortId: 's0l31l',
      slug: 'existing-module',
      title: 'Existing Module',
      isBeta: true,
      grains: [],
      details: {},
    });
    const wrongSlug = 'blabla-module';

    // when
    const screen = await visit(`/modules/preview/s0l31l/${wrongSlug}`);

    // then
    assert.strictEqual(currentURL(), '/modules/preview/s0l31l/existing-module');
    assert.dom(screen.getByRole('heading', { name: 'Existing Module' })).exists();
  });
});
