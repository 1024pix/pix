import { clickByName, render } from '@1024pix/ember-testing-library';
import EditTargetProfileForm from 'pix-admin/components/target-profiles/edit-target-profile-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | TargetProfiles::EditTargetProfileForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  let targetProfileTemplate, framework, tubes1, tubes2, area, thematics, competences;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    tubes1 = [
      store.createRecord('tube', {
        id: 'tubeId1',
        name: '@tubeName1',
        practicalTitle: 'Tube 1',
        skills: [],
        level: 8,
      }),
      store.createRecord('tube', {
        id: 'tubeId2',
        name: '@tubeName2',
        practicalTitle: 'Tube 2',
        skills: [],
        level: 8,
      }),
    ];

    tubes2 = [
      store.createRecord('tube', {
        id: 'tubeId3',
        name: '@tubeName3',
        practicalTitle: 'Tube 3',
        skills: [],
        level: 8,
      }),
    ];
    thematics = [
      store.createRecord('thematic', { id: 'thematicId1', name: 'Thématique 1', tubes: tubes1 }),
      store.createRecord('thematic', { id: 'thematicId2', name: 'Thématique 2', tubes: tubes2 }),
    ];
    competences = [
      store.createRecord('competence', {
        id: 'competenceId',
        index: '1',
        name: 'Titre competence',
        thematics,
      }),
    ];
    area = store.createRecord('area', {
      id: 'areaId',
      title: 'Titre domaine',
      code: 1,
      frameworkId: 'framework1',
      competences,
    });
    framework = store.createRecord('framework', { id: 'framework1', name: 'Pix', areas: [area] });

    targetProfileTemplate = {
      areKnowledgeElementsResettable: false,
      category: 'OTHER',
      comment: '',
      imageUrl: '',
      isPublic: false,
      name: 'A name',
      ownerOrganizationId: 1000,
    };
  });
  const onSubmit = sinon.stub();
  const onCancel = sinon.stub();

  module('on default edit mode', function () {
    test('it should display the items', async function (assert) {
      //given
      const frameworks = [framework];
      const targetProfile = store.createRecord('target-profile', {
        id: 'targetProfile1',
        ...targetProfileTemplate,
      });
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
      const targetProfile = store.createRecord('target-profile', {
        id: 'targetProfile1',
        ...targetProfileTemplate,
      });
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
      const targetProfile = store.createRecord('target-profile', {
        id: 'targetProfile1',
        ...targetProfileTemplate,
      });
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
      const targetProfile = store.createRecord('target-profile', {
        id: 'targetProfile1',
        ...targetProfileTemplate,
        areas: [area],
      });

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
      assert.dom(screen.getByText(/Sélection des sujets/)).exists();
      assert.dom(screen.getByText(/1 · Titre domaine/)).exists();

      await clickByName('Modifier le profil cible');
      assert.ok(onSubmit.called);
    });
  });

  module('when target profile is linked with campaign', function () {
    test('it should display edit form', async function (assert) {
      // given
      const frameworks = [framework];
      const targetProfile = store.createRecord('target-profile', {
        id: 'targetProfile1',
        ...targetProfileTemplate,
        hasLinkedCampaign: true,
      });

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
      assert
        .dom(screen.getByText(/Le référentiel n'est pas modifiable car le profil cible est déjà relié à une campagne/))
        .exists();
      assert.notOk(screen.queryByText(/Sélection des sujets/));
    });
  });
});
