import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click } from '@ember/test-helpers';
import { render, fillByLabel } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | TargetProfiles::BadgeForm', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display the heading in form', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::BadgeForm />`);

    // then
    assert.dom(screen.getByRole('heading', { name: "Création d'un résultat thématique" })).exists();
  });

  test('it should display the expected number of inputs', async function (assert) {
    // given
    const expectedNumberOfInputsInForm = 7;
    const expectedNumberOfCheckboxesInForm = 2;
    const expectedNumberOfSpinButtonsInForm = 2;

    // when
    const screen = await render(hbs`<TargetProfiles::BadgeForm />`);

    // then
    const inputCount = screen.getAllByRole('textbox').length;
    const checkboxCount = screen.getAllByRole('checkbox').length;
    const spinButtonCount = screen.getAllByRole('spinbutton').length;
    assert.strictEqual(inputCount, expectedNumberOfInputsInForm);
    assert.strictEqual(checkboxCount, expectedNumberOfCheckboxesInForm);
    assert.strictEqual(spinButtonCount, expectedNumberOfSpinButtonsInForm);
  });

  test('it should display form actions', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::BadgeForm />`);

    // then
    assert.dom(screen.getByRole('button', { name: 'Créer le badge' })).exists();
    assert.dom(screen.getByText('Annuler')).exists();
  });

  module('#createBadge', function () {
    test('should send badge creation with skillset and campaign participation criteria request to api', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const router = this.owner.lookup('service:router');
      router.transitionTo = sinon.stub();
      const createRecordStub = sinon.stub();
      const saveStub = sinon.stub().resolves();
      createRecordStub.returns({ save: saveStub });
      store.createRecord = createRecordStub;
      const reloadStub = sinon.stub();
      reloadStub.resolves();
      this.targetProfile = { id: 123, reload: reloadStub };

      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);

      // when
      await fillByLabel("Nom de l'image (svg) :", 'nom_de_limage.svg');
      await fillByLabel("Texte alternatif pour l'image :", 'texte alternatif à l‘image');
      await fillByLabel("Clé (texte unique , vérifier qu'il n'existe pas) :", 'clé_du_badge');
      await fillByLabel('Nom de la liste :', 'skill-set-name');
      await fillByLabel('Liste des acquis :', 'skillSetId1,skillSetId2');
      await fillByLabel('Taux de réussite :', '90');
      await fillByLabel('Taux de réussite global :', '50');
      await click(screen.getByRole('button', { name: 'Créer le badge' }));

      // then
      sinon.assert.calledWith(createRecordStub, 'badge', {
        key: 'clé_du_badge',
        altMessage: 'texte alternatif à l‘image',
        imageUrl: 'https://images.pix.fr/badges/nom_de_limage.svg',
        message: '',
        title: '',
        campaignThreshold: '50',
        isCertifiable: false,
        isAlwaysVisible: false,
        skillSetName: 'skill-set-name',
        skillSetSkillsIds: ['skillSetId1', 'skillSetId2'],
        skillSetThreshold: '90',
        cappedTubesCriteria: [],
      });
      sinon.assert.calledWith(saveStub, {
        adapterOptions: {
          targetProfileId: this.targetProfile.id,
        },
      });
      assert.ok(true);
    });
  });

  module('when new target profile format', function (hooks) {
    hooks.beforeEach(function () {
      this.set('targetProfile', {
        isNewFormat: true,
        newAreas: [
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
    test('it should display new creation form', async function (assert) {
      // when
      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);

      // then
      assert.dom(screen.getByRole('checkbox', { name: "Sur l'ensemble du profil cible" })).exists();
      assert.dom(screen.getByRole('checkbox', { name: 'Sur une sélection de sujets du profil cible' })).exists();
    });

    test('it should display campaign-participation criterion form on click', async function (assert) {
      // when
      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);
      await click(screen.getByRole('checkbox', { name: "Sur l'ensemble du profil cible" }));

      // then
      assert.dom(screen.getByRole('heading', { name: 'Critère d’obtention sur l’ensemble du profil cible' })).exists();
      assert.dom(screen.getByLabelText('* Taux de réussite pour obtenir le RT :')).exists();
    });

    test('it should display capped tubes criterion form on click', async function (assert) {
      // when
      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);
      await click(screen.getByRole('checkbox', { name: 'Sur une sélection de sujets du profil cible' }));

      // then
      assert
        .dom(screen.getByRole('heading', { name: 'Critère d’obtention sur une sélection de sujets du profil cible' }))
        .exists();
      assert.dom(screen.getByLabelText('Nom du critère :')).exists();
      assert.dom(screen.getByLabelText('* Taux de réussite pour obtenir le RT :')).exists();
      assert.dom(screen.getByRole('button', { name: 'Supprimer' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Ajouter une nouvelle sélection de sujets' })).exists();
    });

    test('it should add a new criteria on click', async function (assert) {
      // when
      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);
      await click(screen.getByRole('checkbox', { name: 'Sur une sélection de sujets du profil cible' }));
      await click(screen.getByRole('button', { name: 'Ajouter une nouvelle sélection de sujets' }));

      // then
      assert.strictEqual(
        screen.getAllByRole('heading', { name: 'Critère d’obtention sur une sélection de sujets du profil cible' })
          .length,
        2
      );
    });

    test('it should delete criteria on click', async function (assert) {
      // when
      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);
      await click(screen.getByRole('checkbox', { name: 'Sur une sélection de sujets du profil cible' }));
      await click(screen.getByRole('button', { name: 'Ajouter une nouvelle sélection de sujets' }));
      await click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);

      // then
      assert.strictEqual(
        screen.getAllByRole('heading', { name: 'Critère d’obtention sur une sélection de sujets du profil cible' })
          .length,
        1
      );
    });

    test('it should remove all caped tubes criteria when checkox is unchecked ', async function (assert) {
      // when
      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfile={{this.targetProfile}} />`);
      await click(screen.getByRole('checkbox', { name: 'Sur une sélection de sujets du profil cible' }));
      await click(screen.getByRole('button', { name: 'Ajouter une nouvelle sélection de sujets' }));
      await click(screen.getByRole('checkbox', { name: 'Sur une sélection de sujets du profil cible' }));

      // then
      assert.strictEqual(
        screen.queryAllByRole('heading', { name: 'Critère d’obtention sur une sélection de sujets du profil cible' })
          .length,
        0
      );
    });
  });
});
