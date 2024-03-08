import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | TargetProfiles::BadgeForm', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('targetProfile', {
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
    });
  });

  test('it should display the heading in form', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::BadgeForm />`);

    // then
    assert.dom(screen.getByRole('heading', { name: "Création d'un résultat thématique" })).exists();
  });

  test('it should display new creation form', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);

    // then
    assert.dom(screen.getByRole('checkbox', { name: "sur l'ensemble du profil cible" })).exists();
    assert.dom(screen.getByRole('checkbox', { name: 'sur une sélection de sujets du profil cible' })).exists();
  });

  test('it should stop creation and display error message if no criteria is selected', async function (assert) {
    // given
    const notificationErrorStub = sinon.stub().returns();
    class NotificationsStub extends Service {
      error = notificationErrorStub;
    }
    this.owner.register('service:notifications', NotificationsStub);

    // when
    const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);

    await fillIn(screen.getByLabelText(/Nom du résultat thématique/), 'dummy');
    await fillIn(screen.getByLabelText(/Nom de l'image/), 'dummy');
    await fillIn(screen.getByLabelText(/Texte alternatif pour l'image/), 'dummy');
    await fillIn(screen.getByLabelText(/Clé/), 'dummy');

    await click(screen.getByRole('button', { name: 'Enregistrer le RT' }));

    // then
    sinon.assert.calledWith(
      notificationErrorStub,
      "Vous devez sélectionner au moins un critère d'obtention de résultat thématique",
    );
    assert.ok(true);
  });

  module('on campaign-participation criterion selection', function () {
    test('it should display campaign-participation criterion form on click', async function (assert) {
      // when
      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);
      await click(screen.getByRole('checkbox', { name: "sur l'ensemble du profil cible" }));

      // then
      assert.dom(screen.getByRole('heading', { name: 'Critère d’obtention sur l’ensemble du profil cible' })).exists();
      assert.dom(screen.getByLabelText('* Taux de réussite requis :')).exists();
    });
  });

  module('on capped tubes criterion selection', function () {
    test('it should display capped tubes criterion form on click', async function (assert) {
      // when
      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);
      await click(screen.getByRole('checkbox', { name: 'sur une sélection de sujets du profil cible' }));

      // then
      assert
        .dom(screen.getByRole('heading', { name: 'Critère d’obtention sur une sélection de sujets du profil cible' }))
        .exists();
      assert.dom(screen.getByLabelText('Nom du critère :')).exists();
      assert.dom(screen.getByLabelText('* Taux de réussite requis :')).exists();
      assert.dom(screen.getByRole('button', { name: 'Supprimer' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Ajouter une nouvelle sélection de sujets' })).exists();
    });

    test('it should add a new criteria on click', async function (assert) {
      // when
      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);
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
      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);
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
      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);
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
        error = notificationErrorStub;
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);

      await fillIn(screen.getByLabelText(/Nom du résultat thématique/), 'dummy');
      await fillIn(screen.getByLabelText(/Nom de l'image/), 'dummy');
      await fillIn(screen.getByLabelText(/Texte alternatif pour l'image/), 'dummy');
      await fillIn(screen.getByLabelText(/Clé/), 'dummy');

      await click(screen.getByRole('checkbox', { name: 'sur une sélection de sujets du profil cible' }));
      await fillIn(screen.getByLabelText(/Taux de réussite requis/), 20);
      await click(screen.getByRole('button', { name: 'Enregistrer le RT' }));

      // then
      sinon.assert.calledWith(notificationErrorStub, 'Vous devez sélectionner au moins un sujet du profil cible');
      assert.ok(true);
    });
  });
});
