import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | TargetProfiles::EditTargetProfileForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  let targetProfile;
  let onSubmit;
  let onCancel;

  hooks.beforeEach(function () {
    targetProfile = {
      areKnowledgeElementsResettable: false,
      category: 'OTHER',
      comment: '',
      imageUrl: '',
      isPublic: false,
      name: 'A name',
      ownerOrganizationId: 1000,
    };

    onSubmit = sinon.stub();
    onCancel = sinon.stub();

    const store = this.owner.lookup('service:store');
    const frameworks = [store.createRecord('framework', { id: 'framework1', name: 'Pix', areas: [] })];

    this.set('targetProfile', targetProfile);
    this.set('onSubmit', onSubmit);
    this.set('onCancel', onCancel);
    this.set('frameworks', frameworks);
  });

  module('on default edit mode', function () {
    test('it should display the items', async function (assert) {
      // when
      const screen = await render(hbs`<TargetProfiles::EditTargetProfileForm
        @targetProfile={{this.targetProfile}}
        @frameworks={{this.frameworks}}
        @onSubmit={{this.onSubmit}}
        @onCancel={{this.onCancel}}
      />`);

      // then
      assert.dom(screen.getByText(/Information sur le profil cible/)).exists();
      assert.dom(screen.getByLabelText(/Nom/)).exists();
      assert.dom(screen.getByLabelText(/Catégorie/)).exists();
      assert.dom(screen.getByLabelText(/Identifiant de l'organisation de référence/)).exists();
      assert.dom(screen.getByLabelText(/Public/)).exists();
      assert.dom(screen.getByLabelText(/Permettre la remise à zéro des acquis du profil cible/)).exists();

      assert.dom(screen.getByText(/Sélection des sujets/)).exists();
      assert.dom(screen.getByRole('button', { name: 'Importer un fichier JSON' })).exists();

      assert.dom(screen.getByText(/Personnalisation/)).exists();
      assert.dom(screen.getByLabelText("Lien de l'image du profil cible :", { exact: false })).exists();
      assert.dom(screen.getByLabelText('Description :')).exists();
      assert.dom(screen.getByLabelText('Commentaire (usage interne) :')).exists();

      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Créer le profil cible' })).exists();
    });

    test('it should call onSubmit when form is valid', async function (assert) {
      // when
      await render(hbs`<TargetProfiles::EditTargetProfileForm
        @targetProfile={{this.targetProfile}}
        @frameworks={{this.frameworks}}
        @refreshAreas={{this.refreshAreas}}
        @onSubmit={{this.onSubmit}}
        @onCancel={{this.onCancel}}
      />`);

      await clickByName('Créer le profil cible');

      // then
      assert.ok(onSubmit.called);
    });

    test('it should call onCancel when form is cancel', async function (assert) {
      // when
      await render(hbs`<TargetProfiles::EditTargetProfileForm
        @targetProfile={{this.targetProfile}}
        @frameworks={{this.frameworks}}
        @refreshAreas={{this.refreshAreas}}
        @onSubmit={{this.onSubmit}}
        @onCancel={{this.onCancel}}
      />`);

      await clickByName('Annuler');

      // then
      assert.ok(onCancel.called);
    });
  });

  module('on edition mode', function () {
    test('it should display edit form without some fields', async function (assert) {
      // when
      const screen = await render(hbs`<TargetProfiles::EditTargetProfileForm
        @targetProfile={{this.targetProfile}}
        @frameworks={{this.frameworks}}
        @refreshAreas={{this.refreshAreas}}
        @onSubmit={{this.onSubmit}}
        @onCancel={{this.onCancel}}
        @updateMode={{true}}
      />`);

      // then
      assert.notOk(screen.queryByLabelText(/Identifiant de l'organisation de référence/));
      assert.notOk(screen.queryByLabelText(/Public/));

      await clickByName('Modifier le profil cible');
      assert.ok(onSubmit.called);
    });
  });

  module('when target profile is linked with campaign', function () {
    test('it should display edit form', async function (assert) {
      // given
      this.set('targetProfile', {
        ...targetProfile,
        hasLinkedCampaign: true,
      });

      // when
      const screen = await render(hbs`<TargetProfiles::EditTargetProfileForm
        @targetProfile={{this.targetProfile}}
        @frameworks={{this.frameworks}}
        @refreshAreas={{this.refreshAreas}}
        @onSubmit={{this.onSubmit}}
        @onCancel={{this.onCancel}}
      />`);

      // then
      assert
        .dom(screen.getByText(/Le référentiel n'est pas modifiable car le profil cible est déjà relié à une campagne/))
        .exists();
      assert.notOk(screen.queryByText(/Sélection des sujets/));
    });
  });
});
