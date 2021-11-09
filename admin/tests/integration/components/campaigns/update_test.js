import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';
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
    await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
    // then
    assert.dom('label[for="name"]').hasText('Nom de la campagne');
    assert.dom('label[for="customLandingPageText"]').hasText("Texte de la page d'accueil");
    assert.dom('textarea#customLandingPageText').hasAttribute('maxLength', '5000');
    assert.dom('input#name').hasValue('Ceci est un nom');
    assert.contains('Annuler');
    assert.contains('Enregistrer');
  });

  module('when campaign is of type assessment', function (hooks) {
    hooks.beforeEach(function () {
      this.campaign.isTypeAssessment = true;
    });

    test('it should display items for assessment', async function (assert) {
      // when
      await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
      // then
      assert.dom('label[for="title"]').hasText('Titre du parcours');
      assert.dom('label[for="customResultPageText"]').hasText('Texte de la page de fin de parcours');
      assert.dom('label[for="customResultPageButtonText"]').hasText('Texte du bouton de la page de fin de parcours');
      assert.dom('label[for="customResultPageButtonUrl"]').hasText('URL du bouton de la page de fin de parcours');
      assert.dom('input#title').hasValue('Ceci est un titre');
    });

    test('it should display an error text when the title has more than 255 characters', async function (assert) {
      // when
      await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
      await fillInByLabel('Titre du parcours', 'a'.repeat(256));
      // then
      assert.contains('La longueur du titre ne doit pas excéder 255 caractères');
    });

    test('it should display an error text when the customResultPageButtonText has more than 255 characters', async function (assert) {
      // when
      await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
      await fillInByLabel('Texte du bouton de la page de fin de parcours', 'a'.repeat(256));
      // then
      assert.contains('La longueur du texte ne doit pas excéder 255 caractères');
    });

    test('it should display an error text when the customResultPageButtonUrl is not a url', async function (assert) {
      // when
      await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
      await fillInByLabel('URL du bouton de la page de fin de parcours', 'a');
      // then
      assert.contains('Ce champ doit être une URL complète et valide');
    });
  });

  module('when campaign is of type profiles collection', function (hooks) {
    hooks.beforeEach(function () {
      this.campaign.isTypeAssessment = false;
    });

    test('it should display items for profiles collection', async function (assert) {
      // when
      await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
      // then
      assert.dom('label[for="title"]').doesNotExist();
      assert.dom('label[for="customResultPageText"]').doesNotExist();
      assert.dom('label[for="customResultPageButtonText"]').doesNotExist();
      assert.dom('label[for="customResultPageButtonUrl"]').doesNotExist();
    });
  });

  test('it should display an error text when the name is empty', async function (assert) {
    // when
    await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
    await fillInByLabel('Nom de la campagne', '');

    // then
    assert.contains('Le nom ne peut pas être vide');
  });

  test('it should display an error text when the name has more than 255 characters', async function (assert) {
    // when
    await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
    await fillInByLabel('Nom de la campagne', 'a'.repeat(256));
    // then
    assert.contains('La longueur du nom ne doit pas excéder 255 caractères');
  });

  test('it should call update when form is valid', async function (assert) {
    //when
    await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
    await fillInByLabel('Nom de la campagne', 'Nouveau nom');
    await clickByLabel('Enregistrer');

    //then
    assert.ok(this.campaign.save.called);
  });

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(hbs`<Campaigns::update @campaign={{this.campaign}} @onExit={{this.onExit}} />`);
    await clickByLabel('Annuler');

    // then
    assert.ok(this.onExit.called);
  });
});
