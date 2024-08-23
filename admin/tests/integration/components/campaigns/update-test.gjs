import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import Update from 'pix-admin/components/campaigns/update';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaigns | Update', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    class AccessControlStub extends Service {
      hasAccessToCampaignIsForAbsoluteNoviceEditionScope = false;
    }
    this.owner.register('service:access-control', AccessControlStub);
  });

  const onExit = sinon.stub();
  const campaign = EmberObject.create({
    title: 'Ceci est un titre',
    name: 'Ceci est un nom',
    save: sinon.stub(),
  });

  test('it should display the items', async function (assert) {
    // when
    const screen = await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);

    // then
    assert.dom(screen.getByRole('textbox', { name: "Texte de la page d'accueil" })).hasAttribute('maxLength', '5000');
    assert.dom(screen.getByRole('textbox', { name: /Nom de la campagne/ })).hasValue('Ceci est un nom');
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
  });

  module('when campaign is of type assessment', function () {
    test('it should display items for assessment', async function (assert) {
      campaign.isTypeAssessment = true;
      // when
      const screen = await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);

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
      campaign.isTypeAssessment = true;

      // when
      const screen = await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);
      await fillByLabel(
        'Texte du bouton de la page de fin de parcours Si un texte pour le bouton est saisi, une URL est également requise.',
        'a'.repeat(256),
      );

      // then
      assert.dom(screen.getByText('La longueur du texte ne doit pas excéder 255 caractères')).exists();
    });

    test('it should display an error text when the customResultPageButtonUrl is not a url', async function (assert) {
      campaign.isTypeAssessment = true;

      // when
      const screen = await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);
      await fillByLabel(
        'URL du bouton de la page de fin de parcours Si une URL pour le bouton est saisie, le texte est également requis.',
        'a',
      );

      // then
      assert.dom(screen.getByText('Ce champ doit être une URL complète et valide')).exists();
    });
  });

  module('when campaign is of type profiles collection', function () {
    campaign.isTypeAssessment = false;

    test('it should display items for profiles collection', async function (assert) {
      campaign.isTypeAssessment = false;

      // when
      const screen = await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);

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
    const screen = await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);
    await fillByLabel('* Nom de la campagne', '');

    // then
    assert.dom(screen.getByText('Le nom ne peut pas être vide')).exists();
  });

  test('it should display an error text when the name has more than 255 characters', async function (assert) {
    // when
    const screen = await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);
    await fillByLabel('* Nom de la campagne', 'a'.repeat(256));

    // then
    assert.dom(screen.getByText('La longueur du nom ne doit pas excéder 255 caractères')).exists();
  });

  test('it should call Update when form is valid', async function (assert) {
    //when
    await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);
    await fillByLabel('* Nom de la campagne', 'Nouveau nom');
    await clickByName('Enregistrer');

    //then
    assert.ok(campaign.save.called);
  });

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);
    await clickByName('Annuler');

    // then
    assert.ok(onExit.called);
  });

  module('Multiple sendings checkbox', function () {
    test('it should display multiple sendings checkbox when campaign has no participations', async function (assert) {
      //given
      campaign.totalParticipationsCount = 0;

      // when
      const screen = await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);

      // then
      assert.dom(screen.getByRole('checkbox', { name: 'Envoi multiple' })).exists();
    });

    test('it should not display multiple sendings checkbox when campaign has participations', async function (assert) {
      //given
      campaign.totalParticipationsCount = 1;

      // when
      const screen = await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);

      // then
      assert.dom(screen.queryByRole('checkbox', { name: 'Envoi multiple' })).doesNotExist();
    });
  });

  module('is for absolute novice choice', function () {
    module('Campaign is Type Assessment', function () {
      test('should not display choice if hasAccessToCampaignIsForAbsoluteNoviceEditionScope is false', async function (assert) {
        campaign.isTypeAssessment = true;
        // given
        class AccessControlStub extends Service {
          hasAccessToCampaignIsForAbsoluteNoviceEditionScope = false;
        }

        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);

        assert.notOk(
          screen.queryByRole('radiogroup', { name: 'Voulez-vous passer cette campagne en isForAbsoluteNovice' }),
        );
      });

      test('should display choice if hasAccessToCampaignIsForAbsoluteNoviceEditionScope is true', async function (assert) {
        // given
        campaign.isTypeAssessment = true;
        class AccessControlStub extends Service {
          hasAccessToCampaignIsForAbsoluteNoviceEditionScope = true;
        }

        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);

        assert.ok(screen.getByRole('radiogroup', { name: 'Voulez-vous passer cette campagne en isForAbsoluteNovice' }));
      });
    });
  });

  module('Campaign is Type Profiles Collection', function () {
    test('should not display choice if hasAccessToCampaignIsForAbsoluteNoviceEditionScope is true', async function (assert) {
      // given
      campaign.isTypeAssessment = false;
      class AccessControlStub extends Service {
        hasAccessToCampaignIsForAbsoluteNoviceEditionScope = true;
      }

      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(<template><Update @campaign={{campaign}} @onExit={{onExit}} /></template>);

      assert.notOk(
        screen.queryByRole('radiogroup', { name: 'Voulez-vous passer cette campagne en isForAbsoluteNovice' }),
      );
    });
  });
});
