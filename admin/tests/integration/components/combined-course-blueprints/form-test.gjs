import { clickByName, render, within } from '@1024pix/ember-testing-library';
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
      findRecordStub
        .withArgs('module', 'module-123')
        .resolves({ id: 'full-id-module-123', shortId: 'module-123', title: 'module 123' });
      findRecordStub.withArgs('target-profile', '1').resolves({ internalName: 'super pc' });

      const attestations = [
        { id: 5, key: 'PARENTHOOD', label: 'Parentalite' },
        { id: 6, key: 'SIXTH_GRADE', label: '6eme' },
      ];
      const frameworks = [
        {
          id: 123,
          name: 'Pix',
          areas: [],
        },
      ];
      const model = { attestations, frameworks };

      //when
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

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
      sinon.assert.calledOnceWith(blueprintStub.save, { adapterOptions: null });
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

    test('it should display tubes selection component only if the user selects an attestation', async function (assert) {
      //given
      const attestations = [
        { id: 5, key: 'PARENTHOOD', label: 'Parentalite' },
        { id: 6, key: 'SIXTH_GRADE', label: '6eme' },
      ];
      const frameworks = [
        {
          id: 123,
          name: 'Pix',
          areas: [],
        },
      ];
      const model = { attestations, frameworks };
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

      //then
      assert.notOk(await screen.queryByRole('heading', { name: 'Sélection des sujets' }));

      //when
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.attestation.select-label') }),
      );
      await screen.findByRole('listbox');

      await click(screen.getByRole('option', { name: 'Parentalite' }));

      //then
      assert.ok(screen.getByRole('heading', { name: 'Sélection des sujets' }));
      assert.ok(
        screen.getByRole('textbox', { name: t('components.combined-course-blueprints.labels.reward-requirements') }),
      );
      assert.notOk(screen.queryByLabelText('Taux de réussite requis', { exact: false }));
    });

    test('it should save blueprint with selected tubes requirements when they are selected', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const blueprint = store.createRecord('combined-course-blueprint', {
        id: 1,
        name: 'name',
      });
      sinon.stub(blueprint, 'save');
      blueprint.save.resolves();

      const attestations = [
        { id: 5, key: 'PARENTHOOD', label: 'Parentalite' },
        { id: 6, key: 'SIXTH_GRADE', label: '6eme' },
      ];

      const tube = store.createRecord('tube', {
        id: 'tubeId1',
        name: '@tubeName1',
        practicalTitle: 'Tube 1',
        skills: [],
        level: 8,
      });

      const thematic = store.createRecord('thematic', {
        id: 'thematicId',
        name: 'Thématique',
        tubes: [tube],
      });

      const competence = store.createRecord('competence', {
        id: 'competenceId',
        index: '1',
        name: 'Titre competence',
        thematics: [thematic],
      });

      const area = store.createRecord('area', {
        id: 'areaId',
        title: 'Titre domaine',
        code: 1,
        competences: [competence],
      });

      const framework = store.createRecord('framework', {
        id: 'frameworkId',
        name: 'Pix',
        areas: [area],
      });

      const model = {
        attestations,
        frameworks: [framework],
        blueprint,
      };

      //when
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.attestation.select-label') }),
      );
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Parentalite' }));

      assert.ok(screen.getByRole('heading', { name: 'Sélection des sujets' }));
      await clickByName('1 · Titre domaine');
      await clickByName('1 Titre competence');
      await clickByName(/Sélection du niveau du sujet suivant : Tube/);
      const tubesListbox = await within(
        screen.getByRole('cell', { name: /Sélection du niveau du sujet suivant : Tube/ }),
      ).findByRole('listbox');
      await click(within(tubesListbox).getByRole('option', { name: '4' }));
      await fillIn(screen.getByLabelText('Taux de réussite requis', { exact: false }), '75');

      await click(screen.getByRole('button', { name: t('components.combined-course-blueprints.create.createButton') }));

      //then
      sinon.assert.calledOnceWith(blueprint.save, {
        adapterOptions: {
          cappedTubeRequirements: [
            {
              tubes: [{ tubeId: 'tubeId1', level: 4 }],
              threshold: '75',
            },
          ],
        },
      });
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
        attestationLabel: 'attestation',
        rewardRequirements: 'rewardRequirements',
      });
      const model = { blueprint };

      sinon.stub(blueprint, 'save');
      blueprint.save.resolves();
      sinon.stub(router, 'transitionTo');
      router.transitionTo.resolves();

      //when
      const screen = await render(
        <template><CombinedCourseBlueprintForm @updateMode={{true}} @model={{model}} /></template>,
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

      await fillIn(
        screen.getByRole('textbox', { name: t('components.combined-course-blueprints.labels.reward-requirements') }),
        'Updated requirements',
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
      assert.strictEqual(blueprint.rewardRequirements, 'Updated requirements');
      assert.ok(
        pixToastSuccessStub.calledOnceWith({
          message: t('components.combined-course-blueprints.update.notifications.success'),
        }),
      );
      sinon.assert.calledWithExactly(router.transitionTo, 'authenticated.combined-course-blueprints.list');
    });
    test('it should display reward requirements when reward exists', async function (assert) {
      // given
      const blueprint = {
        id: 1,
        name: 'name',
        internalName: 'internalName',
        attestationLabel: 'Label',
        rewardRequirements: 'Atteindre tel niveau sur tel sujet',
      };
      const model = { blueprint };

      //when
      const screen = await render(
        <template><CombinedCourseBlueprintForm @updateMode={{true}} @model={{model}} /></template>,
      );

      //then
      assert
        .dom(
          screen.getByRole('textbox', { name: t('components.combined-course-blueprints.labels.reward-requirements') }),
        )
        .hasValue('Atteindre tel niveau sur tel sujet');
    });
  });

  module('error cases', function () {
    const frameworks = [
      {
        id: 123,
        name: 'Pix',
        areas: [],
      },
    ];
    const model = { frameworks };

    test('it should display a generic error message', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const pixToast = this.owner.lookup('service:pixToast');
      const blueprintStub = { save: sinon.stub().rejects(), content: [] };
      const pixToastSuccessStub = sinon.stub(pixToast, 'sendSuccessNotification');
      const pixToastErrorStub = sinon.stub(pixToast, 'sendErrorNotification');

      sinon.stub(store, 'createRecord').withArgs('combined-course-blueprint').returns(blueprintStub);

      //when
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

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
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

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
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

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
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

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
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

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
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

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

      const frameworks = [
        {
          id: 123,
          name: 'Pix',
          areas: [],
        },
      ];
      const model = { frameworks };

      //when
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

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

      const frameworks = [
        {
          id: 123,
          name: 'Pix',
          areas: [],
        },
      ];
      const model = { frameworks };

      //when

      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

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
