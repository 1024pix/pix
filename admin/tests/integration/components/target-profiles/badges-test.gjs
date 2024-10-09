import { clickByName, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Badges from 'pix-admin/components/target-profiles/badges';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | TargetProfiles::Badges', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there is no badge', function () {
    test('it should display a message when empty', async function (assert) {
      // given
      const badges = [];

      // when
      const screen = await render(<template><Badges @badges={{badges}} /></template>);

      // then
      assert.dom('table').doesNotExist();
      assert.dom(screen.getByText('Aucun résultat thématique associé')).exists();
    });
  });

  module('when there is some badges', function () {
    test('it should display the items', async function (assert) {
      // given
      const badges = [
        EmberObject.create({
          id: 1,
          key: 'My key',
          title: 'My title',
          message: 'My message',
          imageUrl: 'data:,',
          altMessage: 'My alt message',
        }),
      ];

      // when
      const screen = await render(<template><Badges @badges={{badges}} /></template>);

      // then
      assert.dom(screen.queryByText('Aucun résultat thématique associé')).doesNotExist();

      assert.dom(screen.getByRole('table')).exists();

      assert.dom(screen.getAllByRole('columnheader')[0]).hasText('ID');
      assert.dom(screen.getAllByRole('columnheader')[1]).hasText('Image');
      assert.dom(screen.getAllByRole('columnheader')[2]).hasText('Clé');
      assert.dom(screen.getAllByRole('columnheader')[3]).hasText('Nom');
      assert.dom(screen.getAllByRole('columnheader')[4]).hasText('Message');
      assert.dom(screen.getAllByRole('columnheader')[5]).hasText(/Paramètres/);
      assert.dom(screen.getAllByRole('columnheader')[6]).hasText('Actions');

      assert.dom(screen.getByRole('row', { name: 'Informations du badge My title' })).exists();

      assert.dom(screen.getAllByRole('cell')[0].children[0]).hasTagName('a');
      assert
        .dom(screen.getAllByRole('cell')[0].children[0])
        .hasAttribute('aria-label', 'Voir le détail du résultat thématique ID 1');

      assert.strictEqual(screen.getAllByRole('cell')[1].children.length, 1);
      assert.dom(screen.getAllByRole('cell')[1].children[0]).hasTagName('img');
      assert.dom(screen.getAllByRole('cell')[1].children[0]).hasAttribute('src', 'data:,');
      assert.dom(screen.getAllByRole('cell')[1].children[0]).hasAttribute('alt', 'My alt message');

      assert.dom(screen.getAllByRole('cell')[2]).hasText('My key');
      assert.dom(screen.getAllByRole('cell')[3]).hasText('My title');
      assert.dom(screen.getAllByRole('cell')[4]).hasText('My message');

      assert.strictEqual(screen.getAllByRole('cell')[5].children.length, 2);
      assert.dom(screen.getAllByRole('cell')[5].children[0]).hasText('Pas en lacune');
      assert.dom(screen.getAllByRole('cell')[5].children[1]).hasText('Pas certifiable');

      assert.strictEqual(screen.getAllByRole('cell')[6].children.length, 2);
      assert
        .dom(screen.getAllByRole('cell')[6].children[0])
        .hasAttribute('aria-label', 'Voir le détail du résultat thématique My title');
      assert
        .dom(screen.getAllByRole('cell')[6].children[1])
        .hasAttribute('aria-label', 'Supprimer le résultat thématique My title');
    });

    module('when the badge is always visible', function () {
      test('it should display an always visible tag', async function (assert) {
        // given
        const badges = [
          EmberObject.create({
            isAlwaysVisible: true,
          }),
        ];

        // when
        const screen = await render(<template><Badges @badges={{badges}} /></template>);

        // then
        assert.dom(screen.queryByText('Pas en lacune')).doesNotExist();
        assert.dom(screen.getAllByRole('cell')[5].children[0]).hasText('En lacune');
      });
    });

    module('when the badge is certifiable', function () {
      test('it should display a certifiable tag', async function (assert) {
        // given
        const badges = [
          EmberObject.create({
            isCertifiable: true,
          }),
        ];

        // when
        const screen = await render(<template><Badges @badges={{badges}} /></template>);

        // then
        assert.dom(screen.queryByText('Pas certifiable')).doesNotExist();
        assert.dom(screen.getAllByRole('cell')[5].children[1]).hasText('Certifiable');
      });
    });

    module('when there is multiple badges', function () {
      test('it should display a specific row for each badge', async function (assert) {
        // given
        const badges = [
          EmberObject.create({
            id: 1,
            title: 'First badge',
          }),
          EmberObject.create({
            id: 2,
            title: 'Second badge',
          }),
        ];

        // when
        const screen = await render(<template><Badges @badges={{badges}} /></template>);

        // then
        assert.strictEqual(screen.getAllByRole('row').length, 3);
        assert.dom(screen.getAllByRole('row')[1]).hasAttribute('aria-label', 'Informations du badge First badge');
        assert.dom(screen.getAllByRole('row')[2]).hasAttribute('aria-label', 'Informations du badge Second badge');
      });
    });
  });

  module('when deleting a badge', function (hooks) {
    let badge;

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');
      badge = store.push({
        data: {
          id: 'badgeId',
          type: 'badge',
          attributes: {
            key: 'My key',
            title: 'My title',
            message: 'My message',
            imageUrl: 'data:,',
            altMessage: 'My alt message',
          },
        },
      });
      badge.destroyRecord = sinon.stub();
    });

    test('should open confirm modal', async function (assert) {
      //given
      const badges = [badge];

      // when
      const screen = await render(<template><Badges @badges={{badges}} /></template>);
      await clickByName(/Supprimer/);
      await screen.findByRole('dialog');

      // then
      assert.dom(screen.getByRole('heading', { name: "Suppression d'un résultat thématique" })).exists();
      assert
        .dom(
          screen.getByText(
            "Êtes-vous sûr de vouloir supprimer ce résultat thématique ? (Uniquement si le RT n'a pas encore été assigné)",
          ),
        )
        .exists();
    });

    test('should delete the badge on confirmation click', async function (assert) {
      //given
      const badges = [badge];

      // when
      const screen = await render(<template><Badges @badges={{badges}} /></template>);
      await clickByName(/Supprimer/);
      await screen.findByRole('dialog');
      await clickByName('Confirmer');

      // then
      assert.ok(badge.destroyRecord.called);
    });
  });
});
