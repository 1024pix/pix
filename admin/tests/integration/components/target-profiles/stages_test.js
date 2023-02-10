import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | TargetProfiles::Stages', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display add button', async function (assert) {
    // given
    this.set('stages', []);
    this.set('targetProfile', {});

    // when
    const screen = await render(
      hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
    );

    // then
    assert.dom('table').doesNotExist();
    assert.dom(screen.queryByRole('button', { name: 'Nouveau palier' })).exists();
  });

  module('when no stages', function () {
    test('it should display a message', async function (assert) {
      // given
      this.set('stages', []);
      this.set('targetProfile', {});

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
      );

      // then
      assert.dom('table').doesNotExist();
      assert.dom(screen.queryByText('Aucun palier associé')).exists();
    });

    module('when target profile is tube based', function () {
      test('it should display stage type radio buttons', async function (assert) {
        // given
        this.set('stages', []);
        this.set('targetProfile', { isNewFormat: true });

        // when
        const screen = await render(
          hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
        );

        // then
        assert.dom(screen.queryByRole('radio', { name: 'Palier par seuil' })).exists();
        assert.dom(screen.queryByRole('radio', { name: 'Palier par niveau' })).exists();
      });
    });

    module('when target profile is skill based', function () {
      test('it should NOT display stage type radio buttons', async function (assert) {
        // given
        this.set('stages', []);
        this.set('targetProfile', { isNewFormat: false });

        // when
        const screen = await render(
          hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
        );

        // then
        assert.dom(screen.queryByRole('radio', { name: 'Palier par seuil' })).doesNotExist();
        assert.dom(screen.queryByRole('radio', { name: 'Palier par niveau' })).doesNotExist();
      });
    });
  });

  module('when at least one stage', function () {
    test('it should NOT display stage type radio buttons', async function (assert) {
      // given
      const stage = EmberObject.create({
        id: 1,
        threshold: 100,
        title: 'My title',
        message: 'My message',
      });
      this.set('stages', [stage]);
      this.set('targetProfile', { isNewFormat: true });

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
      );

      // then
      assert.dom(screen.queryByRole('radio', { name: 'Palier par seuil' })).doesNotExist();
      assert.dom(screen.queryByRole('radio', { name: 'Palier par niveau' })).doesNotExist();
    });
  });

  module('when stage type is threshold', function () {
    test('it should display the items', async function (assert) {
      // given
      const stage = EmberObject.create({
        id: 1,
        threshold: 100,
        title: 'My title',
        message: 'My message',
      });
      this.set('stages', [stage]);
      this.set('targetProfile', { imageUrl: 'data:,' });

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
      );

      // then
      assert.dom('table').exists();
      assert.dom('thead').exists();
      assert.dom('tbody').exists();
      assert.dom(screen.getByText('Seuil')).exists();
      assert.dom(screen.getByText('Titre')).exists();
      assert.dom(screen.getByText('Message')).exists();
      assert.dom(screen.getByText('Titre prescripteur')).exists();
      assert.dom(screen.getByText('Description prescripteur')).exists();
      assert.dom(screen.getByText('Actions')).exists();
      assert.dom('tbody tr').exists({ count: 1 });
      assert.strictEqual(find('tbody tr td:nth-child(1)').textContent.trim(), '100');
      assert.strictEqual(find('tbody tr td:nth-child(2)').textContent.trim(), 'My title');
      assert.strictEqual(find('tbody tr td:nth-child(3)').textContent.trim(), 'My message');
      assert.strictEqual(find('tbody tr td:nth-child(6)').textContent.trim(), 'Voir détail');
      assert.dom(screen.queryByText('Aucun résultat thématique associé')).doesNotExist();
    });

    test('it should display a message when there is no stages with threshold 0', async function (assert) {
      // given
      this.set('stages', []);
      this.set('targetProfile', {});

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
      );

      // then
      assert.dom('table').doesNotExist();
      assert.dom(screen.getByText('Aucun palier associé')).exists();
    });

    test('it should display a warning when there is no threshold at 0', async function (assert) {
      // given
      const stage = EmberObject.create({
        id: 1,
        threshold: 100,
        title: 'My title',
        message: 'My message',
      });
      this.set('stages', [stage]);
      this.set('targetProfile', {});

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
      );

      // then
      assert.dom(screen.getByText("Attention ! Il n'y a pas de palier à 0")).exists();
    });

    module('when no stage with threshold 0', function () {
      test('it should display warning message', async function (assert) {
        // given
        const stage = EmberObject.create({
          id: 1,
          threshold: 100,
          title: 'My title',
          message: 'My message',
        });
        this.set('stages', [stage]);
        this.set('targetProfile', { imageUrl: 'data:,' });

        // when
        const screen = await render(
          hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
        );

        // then
        assert.dom(screen.queryByText("Attention ! Il n'y a pas de palier à 0")).exists();
      });
    });

    module('when one stage with threshold 0', function () {
      test('it should not display warning message', async function (assert) {
        // given
        const stage = EmberObject.create({
          id: 1,
          threshold: 0,
          title: 'My title',
          message: 'My message',
        });
        this.set('stages', [stage]);
        this.set('targetProfile', { imageUrl: 'data:,' });

        // when
        const screen = await render(
          hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
        );

        // then
        assert.dom(screen.queryByText("Attention ! Il n'y a pas de palier à 0")).doesNotExist();
      });
    });
  });

  module('when stage type is level', function () {
    test('it should display the items', async function (assert) {
      // given
      const stage = EmberObject.create({
        id: 1,
        level: 6,
        isTypeLevel: true,
        title: 'My title',
        message: 'My message',
      });
      this.set('stages', [stage]);
      this.set('targetProfile', { imageUrl: 'data:,' });

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
      );

      // then
      assert.dom('table').exists();
      assert.dom('thead').exists();
      assert.dom('tbody').exists();
      assert.dom(screen.getByText('Niveau')).exists();
      assert.dom(screen.getByText('Titre')).exists();
      assert.dom(screen.getByText('Message')).exists();
      assert.dom(screen.getByText('Titre prescripteur')).exists();
      assert.dom(screen.getByText('Description prescripteur')).exists();
      assert.dom(screen.getByText('Actions')).exists();
      assert.dom('tbody tr').exists({ count: 1 });
      assert.strictEqual(find('tbody tr td:nth-child(1)').textContent.trim(), '6');
      assert.strictEqual(find('tbody tr td:nth-child(2)').textContent.trim(), 'My title');
      assert.strictEqual(find('tbody tr td:nth-child(3)').textContent.trim(), 'My message');
      assert.strictEqual(find('tbody tr td:nth-child(6)').textContent.trim(), 'Voir détail');
      assert.dom(screen.queryByText('Aucun résultat thématique associé')).doesNotExist();
    });

    module('when no stage with level 0', function () {
      test('it should display warning message', async function (assert) {
        // given
        const stage = EmberObject.create({
          id: 1,
          level: 6,
          isTypeLevel: true,
          title: 'My title',
          message: 'My message',
        });
        this.set('stages', [stage]);
        this.set('targetProfile', { imageUrl: 'data:,' });

        // when
        const screen = await render(
          hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
        );

        // then
        assert.dom(screen.queryByText("Attention ! Il n'y a pas de palier à 0")).exists();
      });
    });

    module('when one stage with level 0', function () {
      test('it should not display warning message', async function (assert) {
        // given
        const stage = EmberObject.create({
          id: 1,
          level: 0,
          isTypeLevel: true,
          title: 'My title',
          message: 'My message',
        });
        this.set('stages', [stage]);
        this.set('targetProfile', { imageUrl: 'data:,' });

        // when
        const screen = await render(
          hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}} />`
        );

        // then
        assert.dom(screen.queryByText("Attention ! Il n'y a pas de palier à 0")).doesNotExist();
      });
    });
  });
});
