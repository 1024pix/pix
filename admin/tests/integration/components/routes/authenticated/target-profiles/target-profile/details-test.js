import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/target-profiles/target-profile | details', function(hooks) {

  setupRenderingTest(hooks);

  test('it should display header with name and id', async function(assert) {
    // when
    await render(hbs`<TargetProfiles::Details/>`);

    // then
    assert.contains('ID');
    assert.contains('Nom');
  });

  test('it should display skills list', async function(assert) {
    // given
    const skills = [
      { id: 1 },
      { id: 2 },
    ];
    this.skills = skills;

    // when
    await render(hbs`<TargetProfiles::Details @skills={{this.skills}} />`);

    // then
    assert.dom('[aria-label="Acquis"]').exists({ count: 2 });
  });

  test('it should display target profile data', async function(assert) {
    // given
    this.skills = [{ id: 'rec1', name: '@url2' }];

    // when
    await render(hbs`<TargetProfiles::Details @skills={{this.skills}} />`);

    // then
    assert.dom('[aria-label="Acquis"]').containsText('rec1');
    assert.dom('[aria-label="Acquis"]').containsText('@url2');
  });
});
