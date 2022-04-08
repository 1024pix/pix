import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | TargetProfiles::BadgeForm', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display the form', async function (assert) {
    // when
    await render(hbs`<TargetProfiles::BadgeForm />`);

    // then
    assert.dom('form').exists();
    assert.dom('input').exists();
  });

  test('it should display the expected number of inputs', async function (assert) {
    // given
    const expectedNumberOfInputsInForm = 11;
    const expectedNumberOfTextareasInForm = 2;
    const expectedNumberOfCheckboxesInForm = 2;

    // when
    await render(hbs`<TargetProfiles::BadgeForm />`);

    // then
    assert.dom('input, textarea').exists({ count: expectedNumberOfInputsInForm });
    assert.dom('textarea').exists({ count: expectedNumberOfTextareasInForm });
    assert.dom('input[type="checkbox"]').exists({ count: expectedNumberOfCheckboxesInForm });
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
      await fillIn('input#badge-key', 'clé_du_badge');
      await fillIn('input#image-name', 'nom_de_limage.svg');
      await fillIn('input#alt-message', 'texte alternatif à l‘image');
      await fillIn('input#skillSetThreshold', '90');
      await fillIn('input#skillSetName', 'skill-set-name');
      await fillIn('#skillSetSkills', 'skillSetId1,skillSetId2');
      await fillIn('#campaignParticipationThreshold', '50');
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
