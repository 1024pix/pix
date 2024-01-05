import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillByLabel, clickByName, render } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | Campaigns | Update', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.update = sinon.stub();
    this.onExit = sinon.stub();
    this.campaign = EmberObject.create({
      title: 'Ceci est un titre',
      name: 'Ceci est un nom',
      save: sinon.stub(),
    });

    class AccessControlStub extends Service {
      hasAccessToCampaignIsForAbsoluteNoviceEditionScope = false;
    }

    this.owner.register('service:access-control', AccessControlStub);
  });

  test('it should display the items', async function (assert) {
    // when
    const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);

    // then
    assert.dom(screen.getByRole('textbox', { name: "Texte de la page d'accueil" })).hasAttribute('maxLength', '5000');
    assert.dom(screen.getByRole('textbox', { name: 'Nom de la campagne' })).hasValue('Ceci est un nom');
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
  });

  module('when campaign is of type assessment', function (hooks) {
    hooks.beforeEach(function () {
      this.campaign.isTypeAssessment = true;
    });

    test('it should display items for assessment', async function (assert) {
      // when
      const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Titre du parcours' })).hasValue('Ceci est un titre');
      assert.dom(screen.getByRole('textbox', { name: 'Texte de la page de fin de parcours' })).exists();
      assert
        .dom(
          screen.getByRole('textbox', {
            name: 'Texte du bouton de la page de fin de parcours Si un texte pour le bouton est saisi, une URL est également requise.',
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('textbox', {
            name: 'URL du bouton de la page de fin de parcours Si une URL pour le bouton est saisie, le texte est également requis.',
          }),
        )
        .exists();
    });

    test('it should display an error text when the customResultPageButtonText has more than 255 characters', async function (assert) {
      // when
      const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
      await fillByLabel(
        'Texte du bouton de la page de fin de parcours Si un texte pour le bouton est saisi, une URL est également requise.',
        'a'.repeat(256),
      );

      // then
      assert.dom(screen.getByText('La longueur du texte ne doit pas excéder 255 caractères')).exists();
    });

    test('it should display an error text when the customResultPageButtonUrl is not a url', async function (assert) {
      // when
      const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
      await fillByLabel(
        'URL du bouton de la page de fin de parcours Si une URL pour le bouton est saisie, le texte est également requis.',
        'a',
      );

      // then
      assert.dom(screen.getByText('Ce champ doit être une URL complète et valide')).exists();
    });
  });

  module('when campaign is of type profiles collection', function (hooks) {
    hooks.beforeEach(function () {
      this.campaign.isTypeAssessment = false;
    });

    test('it should display items for profiles collection', async function (assert) {
      // when
      const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);

      // then
      assert.dom(screen.queryByRole('textbox', { name: 'Titre du parcours' })).doesNotExist();
      assert.dom(screen.queryByRole('textbox', { name: 'Texte de la page de fin de parcours' })).doesNotExist();
      assert
        .dom(screen.queryByRole('textbox', { name: 'Texte du bouton de la page de fin de parcours' }))
        .doesNotExist();
      assert.dom(screen.queryByRole('textbox', { name: 'URL du bouton de la page de fin de parcours' })).doesNotExist();
    });
  });

  test('it should display an error text when the name is empty', async function (assert) {
    // when
    const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
    await fillByLabel('* Nom de la campagne', '');

    // then
    assert.dom(screen.getByText('Le nom ne peut pas être vide')).exists();
  });

  test('it should display an error text when the name has more than 255 characters', async function (assert) {
    // when
    const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
    await fillByLabel('* Nom de la campagne', 'a'.repeat(256));

    // then
    assert.dom(screen.getByText('La longueur du nom ne doit pas excéder 255 caractères')).exists();
  });

  test('it should call update when form is valid', async function (assert) {
    //when
    await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
    await fillByLabel('* Nom de la campagne', 'Nouveau nom');
    await clickByName('Enregistrer');

    //then
    assert.ok(this.campaign.save.called);
  });

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
    await clickByName('Annuler');

    // then
    assert.ok(this.onExit.called);
  });

  module('Multiple sendings checkbox', function () {
    test('it should display multiple sendings checkbox when campaign has no participations', async function (assert) {
      //given
      this.campaign.totalParticipationsCount = 0;

      // when
      const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);

      // then
      assert.dom(screen.getByRole('checkbox', { name: 'Envoi multiple' })).exists();
    });

    test('it should not display multiple sendings checkbox when campaign has participations', async function (assert) {
      //given
      this.campaign.totalParticipationsCount = 1;

      // when
      const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);

      // then
      assert.dom(screen.queryByRole('checkbox', { name: 'Envoi multiple' })).doesNotExist();
    });
  });

  module('is for absolute novice choice', function () {
    module('Campaign is Type Assessment', function (hooks) {
      hooks.beforeEach(function () {
        this.campaign.isTypeAssessment = true;
      });

      test('should not display choice if hasAccessToCampaignIsForAbsoluteNoviceEditionScope is false', async function (assert) {
        // given
        class AccessControlStub extends Service {
          hasAccessToCampaignIsForAbsoluteNoviceEditionScope = false;
        }

        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);

        assert.notOk(
          screen.queryByRole('radiogroup', { name: 'Voulez-vous passer cette campagne en isForAbsoluteNovice' }),
        );
      });

      test('should display choice if hasAccessToCampaignIsForAbsoluteNoviceEditionScope is true', async function (assert) {
        // given
        class AccessControlStub extends Service {
          hasAccessToCampaignIsForAbsoluteNoviceEditionScope = true;
        }

        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);

        assert.ok(screen.getByRole('radiogroup', { name: 'Voulez-vous passer cette campagne en isForAbsoluteNovice' }));
      });
    });
  });

  module('Campaign is Type Profiles Collection', function () {
    test('should not display choice if hasAccessToCampaignIsForAbsoluteNoviceEditionScope is true', async function (assert) {
      // given
      this.campaign.isTypeAssessment = false;
      class AccessControlStub extends Service {
        hasAccessToCampaignIsForAbsoluteNoviceEditionScope = true;
      }

      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);

      assert.notOk(
        screen.queryByRole('radiogroup', { name: 'Voulez-vous passer cette campagne en isForAbsoluteNovice' }),
      );
    });
  });
});
