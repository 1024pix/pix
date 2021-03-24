import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | current-organization', (hooks) => {
  setupRenderingTest(hooks);

  test('it displays the name of the given organization', async function(assert) {
    // given
    const organization = { name: 'Orga Nize' };
    this.set('orga', organization);

    // when
    await render(hbs`<CurrentOrganization @organization={{orga}}/>`);

    // then
    assert.dom('.current-organization-panel__label').hasText('MON ORGANISATION');
    assert.dom('.current-organization-panel__name').hasText('Orga Nize');
  });
});
