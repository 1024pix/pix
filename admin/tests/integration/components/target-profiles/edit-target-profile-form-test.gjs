import { clickByName, render } from '@1024pix/ember-testing-library';
import EditTargetProfileForm from 'pix-admin/components/target-profiles/edit-target-profile-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | TargetProfiles::EditTargetProfileForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  let framework;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    framework = store.createRecord('framework', { id: 'framework1', name: 'Pix', areas: [] });
  });

  const targetProfile = {
    areKnowledgeElementsResettable: false,
    category: 'OTHER',
    comment: '',
    imageUrl: '',
    isPublic: false,
    name: 'A name',
    ownerOrganizationId: 1000,
  };
  const onSubmit = sinon.stub();
  const onCancel = sinon.stub();

  module('on default edit mode', function () {
    test('it should display the items', async function (assert) {
      //given
      const frameworks = [framework];

      // when
      const screen = await render(
        <template>
          <EditTargetProfileForm
            @targetProfile={{targetProfile}}
            @frameworks={{frameworks}}
            @onSubmit={{onSubmit}}
            @onCancel={{onCancel}}
          />
        </template>,
      );
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
      //given
      const frameworks = [framework];

      // when
      await render(
        <template>
          <EditTargetProfileForm
            @targetProfile={{targetProfile}}
            @frameworks={{frameworks}}
            @onSubmit={{onSubmit}}
            @onCancel={{onCancel}}
          />
        </template>,
      );

      await clickByName('Créer le profil cible');

      // then
      assert.ok(onSubmit.called);
    });

    test('it should call onCancel when form is cancelled', async function (assert) {
      //given
      const frameworks = [framework];

      // when
      await render(
        <template>
          <EditTargetProfileForm
            @targetProfile={{targetProfile}}
            @frameworks={{frameworks}}
            @onSubmit={{onSubmit}}
            @onCancel={{onCancel}}
          />
        </template>,
      );

      await clickByName('Annuler');

      // then
      assert.ok(onCancel.called);
    });
  });

  module('on edition mode', function () {
    test('it should not display all form fields', async function (assert) {
      //given
      const frameworks = [framework];

      // when
      const screen = await render(
        <template>
          <EditTargetProfileForm
            @targetProfile={{targetProfile}}
            @frameworks={{frameworks}}
            @onSubmit={{onSubmit}}
            @onCancel={{onCancel}}
            @updateMode={{true}}
          />
        </template>,
      );

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
      const frameworks = [framework];
      const targetProfileWitLinkedCampaign = {
        ...targetProfile,
        hasLinkedCampaign: true,
      };

      // when
      const screen = await render(
        <template>
          <EditTargetProfileForm
            @targetProfile={{targetProfileWitLinkedCampaign}}
            @frameworks={{frameworks}}
            @onSubmit={{onSubmit}}
            @onCancel={{onCancel}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.getByText(/Le référentiel n'est pas modifiable car le profil cible est déjà relié à une campagne/))
        .exists();
      assert.notOk(screen.queryByText(/Sélection des sujets/));
    });
  });
});
