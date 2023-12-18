import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | AutonomousCourses::Details', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display autonomous course', async function (assert) {
    // given
    const autonomousCourse = {
      id: 123,
      publicTitle: 'Parcours autonome',
      internalTitle: 'titre interne',
      code: 'CODE',
      createdAt: new Date('2021-01-01'),
    };
    this.set('autonomousCourse', autonomousCourse);

    // when
    const screen = await render(hbs`<AutonomousCourses::Details @autonomousCourse={{this.autonomousCourse}} />`);
    const link = screen.getByRole('link', { name: 'Lien vers la campagne CODE (nouvelle fenêtre)' }).textContent;

    // then
    assert.dom(screen.getByText('123')).exists();
    assert.dom(screen.getByText('Parcours autonome')).exists();
    assert.dom(screen.getByText('titre interne')).exists();
    assert.dom(screen.getByText('01/01/2021')).exists();
    assert.ok(link.trim().endsWith('/campagnes/CODE'));
  });
});
