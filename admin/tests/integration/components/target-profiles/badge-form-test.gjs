import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import BadgeForm from 'pix-admin/components/target-profiles/badge-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | BadgeForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  const targetProfile = {
    areas: [
      {
        id: 'areaId',
        name: 'area1',
        code: 1,
        sortedCompetences: [
          {
            id: 'competenceId',
            index: '1.1',
            name: 'competence1',
            sortedThematics: [
              {
                id: 'thematicId',
                name: 'thematic',
                tubes: [
                  {
                    id: 'tubeId1',
                    name: 'tube1',
                    practicalTitle: 'practicalTitle',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  test('it should display the heading in form', async function (assert) {
    // when
    const screen = await render(<template><BadgeForm /></template>);

    // then
    assert.dom(screen.getByRole('heading', { name: "Création d'un badge" })).exists();
  });

  test('it should display new creation form', async function (assert) {
    // when
    const screen = await render(<template><BadgeForm @targetProfile={{targetProfile}} /></template>);

    // then
    assert.dom(screen.getByRole('checkbox', { name: "sur l'ensemble du profil cible" })).exists();
    assert.dom(screen.getByRole('checkbox', { name: 'sur une sélection de sujets du profil cible' })).exists();
    assert
      .dom(screen.getByRole('link', { name: 'Voir la liste des badges' }))
      .hasAttribute('href', 'https://example-assets.net/list/badges');
  });

  test('it should stop creation and display error message if no criteria is selected', async function (assert) {
    // given
    const notificationErrorStub = sinon.stub().returns();
    class NotificationsStub extends Service {
      sendErrorNotification = notificationErrorStub;
    }
    this.owner.register('service:pixToast', NotificationsStub);

    // when
    const screen = await render(<template><BadgeForm @targetProfile={{targetProfile}} /></template>);

    await fillIn(screen.getByLabelText(/Nom du badge/), 'dummy');
    await fillIn(screen.getByLabelText(/Url de l'image/), 'dummy');
    await fillIn(screen.getByLabelText(/Texte alternatif pour l'image/), 'dummy');
    await fillIn(screen.getByLabelText(/Clé/), 'dummy');

    await click(screen.getByRole('button', { name: 'Enregistrer le badge' }));

    // then
    sinon.assert.calledWith(notificationErrorStub, {
      message: "Vous devez sélectionner au moins un critère d'obtention de badge",
    });
    assert.ok(true);
  });

  module('on campaign-participation criterion selection', function () {
    test('it should display campaign-participation criterion form on click', async function (assert) {
      // when
      const screen = await render(<template><BadgeForm @targetProfile={{targetProfile}} /></template>);
      await click(screen.getByRole('checkbox', { name: "sur l'ensemble du profil cible" }));

      // then
      assert.dom(screen.getByRole('heading', { name: 'Critère d’obtention sur l’ensemble du profil cible' })).exists();
      assert.dom(screen.getByLabelText('Taux de réussite requis *', { exact: false })).exists();
    });
  });

  module('on capped tubes criterion selection', function () {
    test('it should display capped tubes criterion form on click', async function (assert) {
      // when
      const screen = await render(<template><BadgeForm @targetProfile={{targetProfile}} /></template>);
      await click(screen.getByRole('checkbox', { name: 'sur une sélection de sujets du profil cible' }));

      // then
      assert
        .dom(screen.getByRole('heading', { name: 'Critère d’obtention sur une sélection de sujets du profil cible' }))
        .exists();
      assert.dom(screen.getByLabelText('Nom du critère :')).exists();
      assert.dom(screen.getByLabelText('Taux de réussite requis *', { exact: false })).exists();
      assert.dom(screen.getByRole('button', { name: 'Supprimer' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Ajouter une nouvelle sélection de sujets' })).exists();
    });

    test('it should display the expand and collapse buttons', async function (assert) {
      // when
      const screen = await render(<template><BadgeForm @targetProfile={{targetProfile}} /></template>);
      await click(screen.getByRole('checkbox', { name: 'sur une sélection de sujets du profil cible' }));

      // then
      assert.dom(screen.getByRole('button', { name: 'Tout déplier' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Tout replier' })).exists();
    });

    test('it should add a new criteria on click', async function (assert) {
      // when
      const screen = await render(<template><BadgeForm @targetProfile={{targetProfile}} /></template>);
      await click(screen.getByRole('checkbox', { name: 'sur une sélection de sujets du profil cible' }));
      await click(screen.getByRole('button', { name: 'Ajouter une nouvelle sélection de sujets' }));

      // then
      assert.strictEqual(
        screen.getAllByRole('heading', { name: 'Critère d’obtention sur une sélection de sujets du profil cible' })
          .length,
        2,
      );
    });

    test('it should delete criteria on click', async function (assert) {
      // when
      const screen = await render(<template><BadgeForm @targetProfile={{targetProfile}} /></template>);
      await click(screen.getByRole('checkbox', { name: 'sur une sélection de sujets du profil cible' }));
      await click(screen.getByRole('button', { name: 'Ajouter une nouvelle sélection de sujets' }));
      await click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);

      // then
      assert.strictEqual(
        screen.getAllByRole('heading', { name: 'Critère d’obtention sur une sélection de sujets du profil cible' })
          .length,
        1,
      );
    });

    test('it should remove all caped tubes criteria when checkox is unchecked ', async function (assert) {
      // when
      const screen = await render(<template><BadgeForm @targetProfile={{targetProfile}} /></template>);
      await click(screen.getByRole('checkbox', { name: 'sur une sélection de sujets du profil cible' }));
      await click(screen.getByRole('button', { name: 'Ajouter une nouvelle sélection de sujets' }));
      await click(screen.getByRole('checkbox', { name: 'sur une sélection de sujets du profil cible' }));

      // then
      assert.strictEqual(
        screen.queryAllByRole('heading', { name: 'Critère d’obtention sur une sélection de sujets du profil cible' })
          .length,
        0,
      );
    });

    test('it should stop creation and display error message if no target-profile tube is selected', async function (assert) {
      // given
      const notificationErrorStub = sinon.stub().returns();
      class NotificationsStub extends Service {
        sendErrorNotification = notificationErrorStub;
      }
      this.owner.register('service:pixToast', NotificationsStub);

      // when
      const screen = await render(<template><BadgeForm @targetProfile={{targetProfile}} /></template>);

      await fillIn(screen.getByLabelText(/Nom du badge/), 'dummy');
      await fillIn(screen.getByLabelText(/Url de l'image/), 'dummy');
      await fillIn(screen.getByLabelText(/Texte alternatif pour l'image/), 'dummy');
      await fillIn(screen.getByLabelText(/Clé/), 'dummy');

      await click(screen.getByRole('checkbox', { name: 'sur une sélection de sujets du profil cible' }));
      await fillIn(screen.getByLabelText(/Taux de réussite requis/), 20);
      await click(screen.getByRole('button', { name: 'Enregistrer le badge' }));

      // then
      sinon.assert.calledWith(notificationErrorStub, {
        message: 'Vous devez sélectionner au moins un sujet du profil cible',
      });
      assert.ok(true);
    });
  });

  module('on form submission', function () {
    test('should save badge image url with provided url', async function (assert) {
      // given
      const reloadStub = sinon.stub();
      const targetProfileWithBadge = { ...targetProfile, reload: reloadStub };

      const saveStub = sinon.stub();
      const badge = { save: saveStub };
      const createRecordStub = sinon.stub().returns(badge);
      class StoreStub extends Service {
        createRecord = createRecordStub;
      }
      const transitionToSpy = sinon.spy();
      class RouterStub extends Service {
        transitionTo = transitionToSpy;
      }
      this.owner.register('service:store', StoreStub);
      this.owner.register('service:router', RouterStub);
      const imageUrl = 'https://assets.pix.org/badges/new-badge-image.svg';
      const badgeInfo = {
        key: 'NEW_BADGE',
        altMessage: 'Mon nouveau badge',
        message: '',
        title: 'Nouveau badge',
        isCertifiable: false,
        isAlwaysVisible: false,
        campaignThreshold: '75',
        cappedTubesCriteria: [],
        imageUrl: 'https://assets.pix.org/badges/new-badge-image.svg',
      };

      const screen = await render(<template><BadgeForm @targetProfile={{targetProfileWithBadge}} /></template>);

      // when
      await fillIn(screen.getByLabelText(/Nom du badge/), 'Nouveau badge');
      await fillIn(screen.getByLabelText(/Texte alternatif pour l'image/), 'Mon nouveau badge');
      await fillIn(screen.getByLabelText(/Clé/), 'NEW_BADGE');
      await fillIn(
        screen.getByRole('textbox', {
          name: "Url de l'image (svg) *",
        }),
        imageUrl,
      );
      await click(screen.getByRole('checkbox', { name: "sur l'ensemble du profil cible" }));
      await fillIn(
        screen.getByRole('spinbutton', {
          name: 'Taux de réussite requis *',
        }),
        '75',
      );

      await triggerEvent('form', 'submit');

      // then
      assert.ok(createRecordStub.calledOnce);
      sinon.assert.calledOnceWithExactly(createRecordStub, 'badge', badgeInfo);
    });
  });
});
