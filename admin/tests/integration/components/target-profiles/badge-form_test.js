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
      const createRecordStub = sinon.stub();
      const saveStub = sinon.stub().resolves();
      createRecordStub.returns({ save: saveStub });
      store.createRecord = createRecordStub;
      this.targetProfileId = 123;

      const screen = await render(hbs`<TargetProfiles::BadgeForm @targetProfileId={{targetProfileId}} />`);

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
      });
      sinon.assert.calledWith(saveStub, {
        adapterOptions: {
          targetProfileId: this.targetProfileId,
        },
      });
      assert.ok(true);
    });
  });
});
