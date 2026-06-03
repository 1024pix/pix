import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CombinedCourseBlueprintForm from 'pix-admin/components/combined-course-blueprints/form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | CombinedCourseBlueprints::form', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('creation mode', function () {
    test('it should save blueprint in store and transition to combined course blueprint screen when data is valid', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const pixToast = this.owner.lookup('service:pixToast');
      const blueprintStub = { save: sinon.stub().resolves(), content: [] };
      const pixToastSuccessStub = sinon.stub(pixToast, 'sendSuccessNotification');
      const router = this.owner.lookup('service:router');
      sinon.stub(router, 'transitionTo');
      router.transitionTo.resolves();

      sinon.stub(store, 'createRecord').withArgs('combined-course-blueprint').returns(blueprintStub);
      const findRecordStub = sinon.stub(store, 'findRecord');
      const attestations = [
        { id: 5, key: 'PARENTHOOD', label: 'Parentalite' },
        { id: 6, key: 'SIXTH_GRADE', label: '6eme' },
      ];
      findRecordStub
        .withArgs('module', 'module-123')
        .resolves({ id: 'full-id-module-123', shortId: 'module-123', title: 'module 123' });
      findRecordStub.withArgs('target-profile', '1').resolves({ internalName: 'super pc' });

      //when
      const screen = await render(<template><CombinedCourseBlueprintForm @attestations={{attestations}} /></template>);

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );
      await click(screen.getByLabelText(t('components.combined-course-blueprints.labels.module')));
      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        'module-123',
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );
      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.name'), { exact: false }),
        'name',
      );
      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.internal-name'), { exact: false }),
        'internalName',
      );

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.illustration')),
        'illustrations/hello.svg',
      );

      await fillIn(screen.getByLabelText(t('components.combined-course-blueprints.labels.description')), 'description');

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.survey-link')),
        'http://survey-link.fr',
      );

      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.attestation.select-label') }),
      );

      await screen.findByRole('listbox');

      await click(screen.getByRole('option', { name: 'Parentalite' }));

      await click(screen.getByRole('button', { name: t('components.combined-course-blueprints.create.createButton') }));

      //then
      assert.ok(screen.getByRole('heading', { name: t('components.combined-course-blueprints.create.title') }));
      assert.ok(findRecordStub.calledTwice);
      assert.ok(blueprintStub.save.calledOnce);
      assert.strictEqual(blueprintStub.name, 'name');
      assert.strictEqual(blueprintStub.internalName, 'internalName');
      assert.deepEqual(blueprintStub.content, [
        { type: 'evaluation', value: 1, label: 'super pc' },
        { type: 'module', value: 'full-id-module-123', shortId: 'module-123', label: 'module 123' },
      ]);
      assert.strictEqual(blueprintStub.illustration, 'illustrations/hello.svg');
      assert.strictEqual(blueprintStub.description, 'description');
      assert.strictEqual(blueprintStub.surveyLink, 'http://survey-link.fr');
      assert.strictEqual(blueprintStub.rewardId, 5);
      assert.strictEqual(blueprintStub.rewardType, 'ATTESTATION');
      assert.ok(
        pixToastSuccessStub.calledOnceWith({
          message: t('components.combined-course-blueprints.create.notifications.success'),
        }),
      );
      sinon.assert.calledWithExactly(router.transitionTo, 'authenticated.combined-course-blueprints.list');
    });
  });

  module('edition mode', function () {
    test('it should update blueprint in store and transition to combined course blueprint screen when data is valid', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const pixToast = this.owner.lookup('service:pixToast');
      const pixToastSuccessStub = sinon.stub(pixToast, 'sendSuccessNotification');
      const router = this.owner.lookup('service:router');

      const blueprint = store.createRecord('combined-course-blueprint', {
        id: 1,
        name: 'name',
        internalName: 'internalName',
        content: [
          { type: 'evaluation', value: 1, label: 'super pc' },
          { type: 'module', value: 'full-id-module-123', shortId: 'module-123', label: 'module 123' },
        ],
        illustration: 'illustrations/hello.svg',
        description: 'description',
        surveyLink: 'http://survey-link.fr',
        rewardId: 5,
        rewardType: 'ATTESTATION',
      });

      sinon.stub(blueprint, 'save');
      blueprint.save.resolves();
      sinon.stub(router, 'transitionTo');
      router.transitionTo.resolves();

      //when
      const screen = await render(
        <template><CombinedCourseBlueprintForm @updateMode={{true}} @model={{blueprint}} /></template>,
      );

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.name'), { exact: false }),
        'updatedName',
      );
      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.internal-name'), { exact: false }),
        'updatedInternalName',
      );

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.illustration')),
        'illustrations/updatedHello.svg',
      );

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.description')),
        'updatedDescription',
      );

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.survey-link')),
        'http://updated-survey-link.fr',
      );

      await click(screen.getByRole('button', { name: t('components.combined-course-blueprints.update.updateButton') }));

      //then
      assert.ok(screen.getByRole('heading', { name: t('components.combined-course-blueprints.update.title') }));
      assert.ok(blueprint.save.calledOnce);
      assert.strictEqual(blueprint.name, 'updatedName');
      assert.strictEqual(blueprint.internalName, 'updatedInternalName');
      assert.deepEqual(blueprint.content, [
        { type: 'evaluation', value: 1, label: 'super pc' },
        { type: 'module', value: 'full-id-module-123', shortId: 'module-123', label: 'module 123' },
      ]);
      assert.strictEqual(blueprint.illustration, 'illustrations/updatedHello.svg');
      assert.strictEqual(blueprint.description, 'updatedDescription');
      assert.strictEqual(blueprint.surveyLink, 'http://updated-survey-link.fr');
      assert.strictEqual(blueprint.rewardId, 5);
      assert.strictEqual(blueprint.rewardType, 'ATTESTATION');
      assert.ok(
        pixToastSuccessStub.calledOnceWith({
          message: t('components.combined-course-blueprints.update.notifications.success'),
        }),
      );
      sinon.assert.calledWithExactly(router.transitionTo, 'authenticated.combined-course-blueprints.list');
    });
  });

  module('error cases', function () {
    test('it should display a generic error message', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const pixToast = this.owner.lookup('service:pixToast');
      const blueprintStub = { save: sinon.stub().rejects(), content: [] };
      const pixToastSuccessStub = sinon.stub(pixToast, 'sendSuccessNotification');
      const pixToastErrorStub = sinon.stub(pixToast, 'sendErrorNotification');

      sinon.stub(store, 'createRecord').withArgs('combined-course-blueprint').returns(blueprintStub);

      //when
      const screen = await render(<template><CombinedCourseBlueprintForm /></template>);

      await click(screen.getByRole('button', { name: t('components.combined-course-blueprints.create.createButton') }));

      //then
      assert.ok(blueprintStub.save.calledOnce);
      assert.ok(pixToastSuccessStub.notCalled);
      assert.ok(
        pixToastErrorStub.calledOnceWith({
          message: t('components.combined-course-blueprints.create.notifications.error'),
        }),
      );
    });

    test('it should display validation error messages from API', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const pixToast = this.owner.lookup('service:pixToast');
      const blueprintStub = {
        save: sinon.stub().rejects({ errors: [{ status: '400', detail: 'Une donnée est invalide' }] }),
        content: [],
      };
      const pixToastSuccessStub = sinon.stub(pixToast, 'sendSuccessNotification');
      const pixToastErrorStub = sinon.stub(pixToast, 'sendErrorNotification');

      sinon.stub(store, 'createRecord').withArgs('combined-course-blueprint').returns(blueprintStub);

      //when
      const screen = await render(<template><CombinedCourseBlueprintForm /></template>);

      await click(screen.getByRole('button', { name: t('components.combined-course-blueprints.create.createButton') }));

      //then
      assert.ok(blueprintStub.save.calledOnce);
      assert.ok(pixToastSuccessStub.notCalled);
      assert.ok(
        pixToastErrorStub.calledOnceWith({
          message: 'Une donnée est invalide',
        }),
      );
    });

    test('it should display multiple validation error messages from API', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const pixToast = this.owner.lookup('service:pixToast');
      const blueprintStub = {
        save: sinon.stub().rejects({
          errors: [
            { status: '400', detail: 'Une donnée est invalide' },
            { status: '404', detail: "Une donnée n'existe pas" },
            { status: '412', detail: 'Une erreur est survenue' },
          ],
        }),
        content: [],
      };
      const pixToastSuccessStub = sinon.stub(pixToast, 'sendSuccessNotification');
      const pixToastErrorStub = sinon.stub(pixToast, 'sendErrorNotification');

      sinon.stub(store, 'createRecord').withArgs('combined-course-blueprint').returns(blueprintStub);

      //when
      const screen = await render(<template><CombinedCourseBlueprintForm /></template>);

      await click(screen.getByRole('button', { name: t('components.combined-course-blueprints.create.createButton') }));

      //then
      assert.ok(blueprintStub.save.calledOnce);
      assert.ok(pixToastSuccessStub.notCalled);
      assert.ok(
        pixToastErrorStub.calledWith({
          message: 'Une donnée est invalide',
        }),
      );
      assert.ok(
        pixToastErrorStub.calledWith({
          message: "Une donnée n'existe pas",
        }),
      );
      assert.ok(
        pixToastErrorStub.calledWith({
          message: 'Une erreur est survenue',
        }),
      );
    });

    test('it should display an error if target profile does not exist', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const pixToast = this.owner.lookup('service:pixToast');
      const blueprintStub = { save: sinon.stub().resolves(), content: [] };
      const pixToastErrorStub = sinon.stub(pixToast, 'sendErrorNotification');

      sinon.stub(store, 'createRecord').withArgs('combined-course-blueprint').returns(blueprintStub);
      const findRecordStub = sinon.stub(store, 'findRecord');
      findRecordStub
        .withArgs('target-profile')
        .rejects({ errors: [{ status: '404', detail: 'Le profil cible est introuvable' }] });

      //when
      const screen = await render(<template><CombinedCourseBlueprintForm /></template>);

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      //then
      assert.ok(
        pixToastErrorStub.calledOnceWith({
          message: t('components.combined-course-blueprints.create.notifications.targetProfileNotFound'),
        }),
      );
    });

    test('it should display an error if module does not exist', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const pixToast = this.owner.lookup('service:pixToast');
      const blueprintStub = { save: sinon.stub().resolves(), content: [] };
      const pixToastErrorStub = sinon.stub(pixToast, 'sendErrorNotification');

      sinon.stub(store, 'createRecord').withArgs('combined-course-blueprint').returns(blueprintStub);
      const findRecordStub = sinon.stub(store, 'findRecord');
      findRecordStub.withArgs('module').rejects({ errors: [{ status: '404', detail: 'Le module est introuvable' }] });

      //when
      const screen = await render(<template><CombinedCourseBlueprintForm /></template>);

      await click(screen.getByLabelText(t('components.combined-course-blueprints.labels.module')));
      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        'module-123',
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      //then
      assert.ok(
        pixToastErrorStub.calledOnceWith({
          message: t('components.combined-course-blueprints.create.notifications.moduleNotFound'),
        }),
      );
    });

    test('it should display an error if fetching ressource failed', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const pixToast = this.owner.lookup('service:pixToast');
      const blueprintStub = { save: sinon.stub().resolves(), content: [] };
      const pixToastErrorStub = sinon.stub(pixToast, 'sendErrorNotification');

      sinon.stub(store, 'createRecord').withArgs('combined-course-blueprint').returns(blueprintStub);
      const findRecordStub = sinon.stub(store, 'findRecord');
      findRecordStub.withArgs('target-profile').rejects();

      //when
      const screen = await render(<template><CombinedCourseBlueprintForm /></template>);

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      //then
      assert.ok(
        pixToastErrorStub.calledOnceWith({
          message: t('components.combined-course-blueprints.create.notifications.addItemError'),
        }),
      );
    });
  });

  module('combined course blueprint items', function () {
    test('should display tag for item when added', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const findRecordStub = sinon.stub(store, 'findRecord');
      findRecordStub
        .withArgs('module', 'module123')
        .resolves({ id: 'full-id-module123', shortId: 'module123', title: 'module 123' });
      findRecordStub.withArgs('target-profile', '1').resolves({ internalName: 'super pc' });
      //when
      const screen = await render(<template><CombinedCourseBlueprintForm /></template>);

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );
      await click(screen.getByLabelText(t('components.combined-course-blueprints.labels.module')));
      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        'module123',
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      assert.ok(screen.getByText(/Profil Cible - 1 - super pc/));
      assert.ok(screen.getByText('Module - module123 - module 123'));
    });
    test('it should remove item when user clicks on remove button', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const findRecordStub = sinon.stub(store, 'findRecord');

      findRecordStub.withArgs('target-profile', '1').resolves({ internalName: 'super pc' });
      //when

      const screen = await render(<template><CombinedCourseBlueprintForm /></template>);

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      assert.ok(screen.getByText(/Profil Cible - 1 - super pc/));
      await click(screen.getByRole('button', { name: 'Supprimer' }));

      //then
      assert.notOk(screen.queryByText(/Profil Cible - 1 - super pc/));
    });
  });
});
