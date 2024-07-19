import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | TargetProfiles::Category', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display the tag for type COMPETENCES', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::Category @category='COMPETENCES' />`);

    // then
    assert.dom(screen.getByText('Les 16 compétences')).exists();
  });

  test('it should display the tag for type SUBJECT', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::Category @category='SUBJECT' />`);

    // then
    assert.dom(screen.getByText('Thématiques')).exists();
  });

  test('it should display the tag for type DISCIPLINE', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::Category @category='DISCIPLINE' />`);

    // then
    assert.dom(screen.getByText('Disciplinaires')).exists();
  });

  test('it should display the tag for type CUSTOM', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::Category @category='CUSTOM' />`);

    // then
    assert.dom(screen.getByText('Parcours sur-mesure')).exists();
  });

  test('it should display the tag for type PREDEFINED', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::Category @category='PREDEFINED' />`);

    // then
    assert.dom(screen.getByText('Parcours prédéfinis')).exists();
  });

  test('it should display the tag for type OTHER', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::Category @category='OTHER' />`);

    // then
    assert.dom(screen.getByText('Autres')).exists();
  });

  test('it should display the tag for type TARGETED', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::Category @category='TARGETED' />`);

    // then
    assert.dom(screen.getByText('Parcours ciblés')).exists();
  });

  test('it should display the tag for type BACK_TO_SCHOOL', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::Category @category='BACK_TO_SCHOOL' />`);

    // then
    assert.dom(screen.getByText('Parcours de rentrée / 6e')).exists();
  });
});
