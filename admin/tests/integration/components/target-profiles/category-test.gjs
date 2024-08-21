import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import Category from 'pix-admin/components/target-profiles/category';
import { module, test } from 'qunit';

module('Integration | Component | Category', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display the tag for type COMPETENCES', async function (assert) {
    // when
    const screen = await render(<template><Category @category="COMPETENCES" /></template>);

    // then
    assert.dom(screen.getByText('Les 16 compétences')).exists();
  });

  test('it should display the tag for type SUBJECT', async function (assert) {
    // when
    const screen = await render(<template><Category @category="SUBJECT" /></template>);

    // then
    assert.dom(screen.getByText('Thématiques')).exists();
  });

  test('it should display the tag for type DISCIPLINE', async function (assert) {
    // when
    const screen = await render(<template><Category @category="DISCIPLINE" /></template>);

    // then
    assert.dom(screen.getByText('Disciplinaires')).exists();
  });

  test('it should display the tag for type CUSTOM', async function (assert) {
    // when
    const screen = await render(<template><Category @category="CUSTOM" /></template>);

    // then
    assert.dom(screen.getByText('Parcours sur-mesure')).exists();
  });

  test('it should display the tag for type PREDEFINED', async function (assert) {
    // when
    const screen = await render(<template><Category @category="PREDEFINED" /></template>);

    // then
    assert.dom(screen.getByText('Parcours prédéfinis')).exists();
  });

  test('it should display the tag for type OTHER', async function (assert) {
    // when
    const screen = await render(<template><Category @category="OTHER" /></template>);

    // then
    assert.dom(screen.getByText('Autres')).exists();
  });

  test('it should display the tag for type TARGETED', async function (assert) {
    // when
    const screen = await render(<template><Category @category="TARGETED" /></template>);

    // then
    assert.dom(screen.getByText('Parcours ciblés')).exists();
  });

  test('it should display the tag for type BACK_TO_SCHOOL', async function (assert) {
    // when
    const screen = await render(<template><Category @category="BACK_TO_SCHOOL" /></template>);

    // then
    assert.dom(screen.getByText('Parcours de rentrée / 6e')).exists();
  });
});
