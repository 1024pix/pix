import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, fillIn } from '@ember/test-helpers';
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
    const expectedNumberOfInputsInForm = 8;
    const expectedNumberOfTextareasInForm = 1;
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
    await render(hbs`<TargetProfiles::BadgeForm />`);

    // then
    assert.dom('a[data-test="badge-form-cancel-button"]').exists();
    assert.dom('button[data-test="badge-form-submit-button"]').exists();
  });

  module('#createBadge', function () {
    test('should send badge creation request to api', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const createRecordStub = sinon.stub();
      const saveStub = sinon.stub().resolves();
      createRecordStub.returns({ save: saveStub });
      store.createRecord = createRecordStub;
      this.targetProfileId = 123;

      await render(hbs`<TargetProfiles::BadgeForm @targetProfileId={{targetProfileId}} />`);

      // when
      await fillIn('input#badge-key', 'clé_du_badge');
      await fillIn('input#image-name', 'nom_de_limage.svg');
      await fillIn('input#alt-message', 'texte alternatif à l‘image');
      await click('button[data-test="badge-form-submit-button"]');

      // then
      sinon.assert.calledWith(createRecordStub, 'badge', {
        key: 'clé_du_badge',
        altMessage: 'texte alternatif à l‘image',
        imageUrl: 'https://images.pix.fr/badges/nom_de_limage.svg',
        message: '',
        title: '',
        isCertifiable: false,
        isAlwaysVisible: false,
      });
      sinon.assert.calledWith(saveStub, {
        adapterOptions: {
          targetProfileId: this.targetProfileId,
        },
      });
      assert.ok(true);
    });

    test('should send badgeCriteria creation request to api', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const createRecordStub = sinon.stub();
      const saveStub = sinon.stub();
      const badge = { id: 'badgeId', save: saveStub };
      createRecordStub.onFirstCall().returns(badge);
      createRecordStub.onSecondCall().returns({ save: saveStub });
      store.createRecord = createRecordStub;

      await render(hbs`<TargetProfiles::BadgeForm @targetProfileId={{targetProfileId}} />`);

      // when
      await fillIn('input#badge-key', 'clé_du_badge');
      await fillIn('input#image-name', 'nom_de_limage.svg');
      await fillIn('input#alt-message', 'texte alternatif à l‘image');
      await fillIn('input#campaignParticipationThreshold', '65');
      await click('button[data-test="badge-form-submit-button"]');

      // then
      sinon.assert.calledWith(createRecordStub.secondCall, 'badge-criterion', {
        threshold: '65',
        scope: 'CampaignParticipation',
        badge,
      });
      sinon.assert.calledWith(saveStub.secondCall);
      assert.ok(true);
    });
  });
});
