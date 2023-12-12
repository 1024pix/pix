import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | AutonomousCourses::ListItems', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display a autonomous courses list', async function (assert) {
    // given
    const autonomousCoursesList = [
      {
        id: 1002,
        name: 'Parcours autonome 2023',
        createdAt: new Date('2023-01-01'),
      },
      {
        id: 1001,
        name: 'Parcours autonome 2020',
        createdAt: new Date('2020-01-01'),
      },
    ];
    this.set('autonomousCoursesList', autonomousCoursesList);

    // when
    const screen = await render(hbs`<AutonomousCourses::ListItems @items={{this.autonomousCoursesList}} />`);

    // then
    assert.dom(screen.getByText('Id')).exists();
    assert.dom(screen.getByText('1002')).exists();
    assert.dom(screen.getByText('1001')).exists();

    assert.dom(screen.getByText('Nom')).exists();
    assert.dom(screen.getByRole('link', { name: 'Parcours autonome 2023' })).exists();
    assert.dom(screen.getByRole('link', { name: 'Parcours autonome 2020' })).exists();

    assert.dom(screen.getByText('Date de création')).exists();
    assert.dom(screen.getByText('01/01/2023')).exists();
    assert.dom(screen.getByText('01/01/2020')).exists();

    assert.dom(screen.getByText('Statut')).exists();
    assert.strictEqual(screen.getAllByText('Actif').length, 2);
  });

  test('it should display a autonomous course with archived tag', async function (assert) {
    // given
    const autonomousCoursesList = [
      {
        id: 1002,
        name: 'Parcours autonome 2023',
        createdAt: new Date('2023-01-01'),
        archivedAt: new Date('2023-02-02'),
      },
    ];
    this.set('autonomousCoursesList', autonomousCoursesList);

    // when
    const screen = await render(hbs`<AutonomousCourses::ListItems @items={{this.autonomousCoursesList}} />`);

    // then
    assert.dom(screen.getByText('Archivé')).exists();
  });
});
