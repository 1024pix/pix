import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillByLabel, clickByName, render } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

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
  });

  test('it should display the items', async function (assert) {
    // when
    const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);

    // then
    assert.dom(screen.getByRole('textbox', { name: "Texte de la page d'accueil" })).hasAttribute('maxLength', '5000');
    assert.dom(screen.getByRole('textbox', { name: 'obligatoire Nom de la campagne' })).hasValue('Ceci est un nom');
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
      assert.dom(screen.getByRole('textbox', { name: 'Texte du bouton de la page de fin de parcours' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'URL du bouton de la page de fin de parcours' })).exists();
    });

    test('it should display an error text when the customResultPageButtonText has more than 255 characters', async function (assert) {
      // when
      const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
      await fillByLabel('Texte du bouton de la page de fin de parcours', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText('La longueur du texte ne doit pas excéder 255 caractères')).exists();
    });

    test('it should display an error text when the customResultPageButtonUrl is not a url', async function (assert) {
      // when
      const screen = await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
      await fillByLabel('URL du bouton de la page de fin de parcours', 'a');

      // then
      assert.dom(screen.getByText('Ce champ doit être une URL complète et valide')).exists();
    });

    test('it should trim extra spaces written by user from title attibute', async function (assert) {
      // when
      await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
      await fillByLabel('Titre du parcours', ' text with space ');
      await clickByName('Enregistrer');

      // then
      assert.deepEqual(this.campaign.title, 'text with space');
    });

    test("It should return 'null' when title is empty", async function (assert) {
      // when
      await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
      await fillByLabel('Titre du parcours', '');
      await clickByName('Enregistrer');

      // then
      assert.strictEqual(this.campaign.title, null);
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

  test('it should trim extra spaces written by user from custom landing page attibute', async function (assert) {
    // when
    await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
    await fillByLabel("Texte de la page d'accueil", ' text with space ');
    await clickByName('Enregistrer');

    // then
    assert.deepEqual(this.campaign.customLandingPageText, 'text with space');
  });

  test("It should return 'null' when custom landing page attribute is empty", async function (assert) {
    // when
    await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
    await fillByLabel("Texte de la page d'accueil", '');
    await clickByName('Enregistrer');

    // then
    assert.strictEqual(this.campaign.customLandingPageText, null);
  });

  test("It should return 'null' when custom landing page attribute has only white space", async function (assert) {
    // when
    await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
    await fillByLabel("Texte de la page d'accueil", ' ');
    await clickByName('Enregistrer');

    // then
    assert.strictEqual(this.campaign.customLandingPageText, null);
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
});
