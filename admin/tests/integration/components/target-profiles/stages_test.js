import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, click } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | TargetProfiles::Stages', function (hooks) {
  setupRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('it should display add button', async function (assert) {
    // given
    const stage = store.createRecord('stage', {
      level: 1,
    });
    const stageCollection = store.createRecord('stage-collection', {
      stages: [stage],
    });
    this.set('stageCollection', stageCollection);
    this.set('maxLevel', 2);

    // when
    const screen = await render(
      hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Nouveau palier' })).exists();
  });

  module('when no stages', function () {
    test('it should display a message', async function (assert) {
      // given
      const stageCollection = store.createRecord('stage-collection', {
        stages: [],
      });
      this.set('stageCollection', stageCollection);
      this.set('maxLevel', 2);

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
      );

      // then
      assert.dom('table').doesNotExist();
      assert.dom(screen.queryByText('Aucun palier associé')).exists();
    });

    module('when target profile is tube based', function () {
      test('it should display stage type radio buttons', async function (assert) {
        // given
        const stageCollection = store.createRecord('stage-collection', {
          stages: [],
        });
        this.set('stageCollection', stageCollection);
        this.set('maxLevel', 2);

        // when
        const screen = await render(
          hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
        );

        // then
        assert.dom(screen.queryByRole('radio', { name: 'Palier par seuil' })).exists();
        assert.dom(screen.queryByRole('radio', { name: 'Palier par niveau' })).exists();
      });
    });
  });

  module('when at least one stage', function () {
    test('it should NOT display stage type radio buttons', async function (assert) {
      // given
      const stage = store.createRecord('stage', {
        id: 1,
        level: 0,
        title: 'stage 1',
      });
      const stageCollection = store.createRecord('stage-collection', {
        stages: [stage],
      });
      this.set('stageCollection', stageCollection);
      this.set('maxLevel', 2);

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
      );

      // then
      assert.dom(screen.getByText('Voir détail')).exists();
    });

    test('it should display delete button on a stage', async function (assert) {
      // given
      const stage = store.createRecord('stage', {
        id: 1,
        level: 1,
      });
      const stageCollection = store.createRecord('stage-collection', {
        stages: [stage],
      });
      this.set('stageCollection', stageCollection);
      this.set('maxLevel', 2);

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
      );

      // then
      assert.dom(screen.queryByRole('button', { name: /Supprimer/ })).exists();
    });

    test('it should display modal when deleting a stage', async function (assert) {
      // given
      const stage = store.createRecord('stage', {
        id: 1,
        level: 1,
      });
      const stageCollection = store.createRecord('stage-collection', {
        stages: [stage],
      });
      this.set('stageCollection', stageCollection);
      this.set('maxLevel', 2);

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
      );
      await click(screen.getByRole('button', { name: /Supprimer/ }));
      await screen.findByRole('dialog');

      // then
      assert.dom(screen.getByText('Confirmer la suppression')).exists();
      assert.dom(screen.getByRole('button', { name: 'Valider' })).exists();
    });

    test('it should display add "firstSkill" button', async function (assert) {
      // given
      const stage = store.createRecord('stage', {
        level: 1,
      });
      const stageCollection = store.createRecord('stage-collection', {
        stages: [stage],
      });
      this.set('stageCollection', stageCollection);
      this.set('maxLevel', 2);

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
      );

      // then
      assert.dom(screen.queryByRole('button', { name: 'Nouveau palier "1er acquis"' })).exists();
      assert.dom(screen.queryByRole('button', { name: 'Nouveau palier "1er acquis"' })).hasNoAttribute('disabled');
    });
  });

  module('when a firstSkill stage is already in the collection', function () {
    test('it should disable add "firstSkill" button', async function (assert) {
      // given
      const stage = store.createRecord('stage', {
        level: 0,
        isFirstSkill: false,
      });
      const firstSkillStage = store.createRecord('stage', {
        level: null,
        threshold: null,
        isFirstSkill: true,
      });
      const stageCollection = store.createRecord('stage-collection', {
        stages: [stage, firstSkillStage],
      });
      this.set('stageCollection', stageCollection);
      this.set('maxLevel', 2);

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
      );

      // then
      assert.dom(screen.queryByRole('button', { name: 'Nouveau palier "1er acquis"' })).exists();
      assert.dom(screen.queryByRole('button', { name: 'Nouveau palier "1er acquis"' })).hasAttribute('disabled');
    });
  });

  module('when stage type is threshold', function () {
    test('it should display the items', async function (assert) {
      // given
      const stage = store.createRecord('stage', {
        id: 1,
        threshold: 100,
        title: 'My title',
        message: 'My message',
      });
      const stageCollection = store.createRecord('stage-collection', {
        stages: [stage],
      });
      this.set('stageCollection', stageCollection);
      this.set('maxLevel', 2);

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
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
      assert.dom(screen.getByText('Voir détail')).exists();
      assert.dom(screen.getByRole('button', { name: /Supprimer/ })).exists();
      assert.dom(screen.queryByText('Aucun résultat thématique associé')).doesNotExist();
    });

    test('it should display a warning when there is no threshold at 0', async function (assert) {
      // given
      const stage = store.createRecord('stage', {
        id: 1,
        threshold: 100,
        title: 'My title',
        message: 'My message',
      });
      const stageCollection = store.createRecord('stage-collection', {
        stages: [stage],
      });
      this.set('stageCollection', stageCollection);
      this.set('maxLevel', 2);

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
      );

      // then
      assert.dom(screen.getByText("Attention ! Il n'y a pas de palier à 0")).exists();
    });

    test('it should not display warning message when there is a stage with threshold 0', async function (assert) {
      // given
      const stage = store.createRecord('stage', {
        id: 1,
        threshold: 0,
        title: 'My title',
        message: 'My message',
      });
      const stageCollection = store.createRecord('stage-collection', {
        stages: [stage],
      });
      this.set('stageCollection', stageCollection);
      this.set('maxLevel', 2);

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
      );

      // then
      assert.dom(screen.queryByText("Attention ! Il n'y a pas de palier à 0")).doesNotExist();
    });
  });

  module('when stage type is level', function () {
    test('it should display the items', async function (assert) {
      // given
      const stage = store.createRecord('stage', {
        id: 1,
        level: 6,
        title: 'My title',
        message: 'My message',
      });
      const stageCollection = store.createRecord('stage-collection', {
        stages: [stage],
      });
      this.set('stageCollection', stageCollection);
      this.set('maxLevel', 2);

      // when
      const screen = await render(
        hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
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
      assert.dom(screen.getByText('Voir détail')).exists();
      assert.dom(screen.getByRole('button', { name: /Supprimer/ })).exists();
      assert.dom(screen.queryByText('Aucun résultat thématique associé')).doesNotExist();
    });

    module('when one stage with level 0', function () {
      test('it should not display warning message', async function (assert) {
        // given
        const stage = store.createRecord('stage', {
          id: 1,
          level: 0,
          title: 'My title',
          message: 'My message',
        });
        const stageCollection = store.createRecord('stage-collection', {
          stages: [stage],
        });
        this.set('stageCollection', stageCollection);
        this.set('maxLevel', 2);

        // when
        const screen = await render(
          hbs`<TargetProfiles::Stages @targetProfileId={{123}} @stageCollection={{this.stageCollection}} @maxLevel={{this.maxLevel}}/>`
        );

        // then
        assert.dom(screen.queryByText("Attention ! Il n'y a pas de palier à 0")).doesNotExist();
      });
    });
  });
});
