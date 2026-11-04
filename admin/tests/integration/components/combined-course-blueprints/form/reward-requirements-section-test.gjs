import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CombinedCourseBlueprintForm from 'pix-admin/components/combined-course-blueprints/form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import selectOption from '../../../../helpers/select-option';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Reward Requirements Section', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('creation mode', function (hooks) {
    let blueprint, attestations, findRecordStub;

    hooks.beforeEach(function () {
      // given
      const store = this.owner.lookup('service:store');

      blueprint = store.createRecord('combined-course-blueprint', {
        id: '1',
        name: 'name',
      });
      sinon.stub(blueprint, 'save');
      blueprint.save.resolves();

      attestations = [
        { id: '5', key: 'PARENTHOOD', label: 'Parentalite' },
        { id: '6', key: 'SIXTH_GRADE', label: '6eme' },
      ];

      findRecordStub = sinon.stub(store, 'findRecord');
      const tube1 = {
        id: 'tubeId3',
        name: '@tubeName3',
        practicalTitle: 'Tube 3',
        skills: [],
        level: 8,
      };
      findRecordStub.withArgs('tube', 'tubeId3').resolves(tube1);

      const thematic1 = {
        id: 'thematicId2',
        name: 'Thématique 2',
        tubes: [tube1],
      };
      findRecordStub.withArgs('thematic', 'thematicId2').resolves(thematic1);

      const competence1 = {
        id: 'competenceId2',
        index: '2',
        name: 'Titre competence 2',
        thematics: [thematic1],
      };
      findRecordStub.withArgs('competence', 'competenceId2').resolves(competence1);

      const area1 = {
        id: 'areaId2',
        title: 'Titre domaine 2',
        code: 2,
        competences: [competence1],
      };
      findRecordStub.withArgs('area', 'areaId2').resolves(area1);

      findRecordStub
        .withArgs('target-profile', '1')
        .resolves({ internalName: 'super pc', imageUrl: 'imageUrl', areas: [area1] });

      const tube2 = {
        id: 'tubeId4',
        name: '@tubeName4',
        practicalTitle: 'Tube 4',
        skills: [],
        level: 8,
      };
      findRecordStub.withArgs('tube', 'tubeId3').resolves(tube2);

      const thematic2 = {
        id: 'thematicId3',
        name: 'Thématique 3',
        tubes: [tube2],
      };
      findRecordStub.withArgs('thematic', 'thematicId2').resolves(thematic2);

      const competence2 = {
        id: 'competenceId3',
        index: '3',
        name: 'Titre competence 3',
        thematics: [thematic2],
      };
      findRecordStub.withArgs('competence', 'competenceId2').resolves(competence2);

      const area2 = {
        id: 'areaId3',
        title: 'Titre domaine 3',
        code: 3,
        competences: [competence2],
      };
      findRecordStub.withArgs('area', 'areaId2').resolves(area2);

      findRecordStub
        .withArgs('target-profile', '2')
        .resolves({ internalName: 'super pc 2', imageUrl: 'imageUrl', areas: [area1, area2] });

      findRecordStub.withArgs('module', 'module-123').resolves({
        id: 'full-id-module-123',
        shortId: 'module-123',
        title: 'module 123',
        details: { image: 'image' },
      });
    });
    test('it should display tubes selection component when the necessary conditions are met', async function (assert) {
      //given
      const attestations = [
        { id: '5', key: 'PARENTHOOD', label: 'Parentalite' },
        { id: '6', key: 'SIXTH_GRADE', label: '6eme' },
      ];

      const model = { attestations };
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

      //when
      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );

      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      //then
      assert.ok(
        await screen.getByRole('heading', {
          name: t('components.combined-course-blueprints.create.attestations'),
        }),
      );
      assert.notOk(
        await screen.queryByRole('textbox', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.description'),
        }),
      );
      assert.notOk(
        await screen.queryByRole('button', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.add-new-tubes-selection'),
        }),
      );
      assert.notOk(
        await screen.queryByRole('heading', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.capped-tubes-criteria'),
        }),
      );

      //when
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.attestation.select-label') }),
      );
      await selectOption(screen, t('components.combined-course-blueprints.attestation.select-label'), 'Parentalite');

      await click(
        screen.getByRole('radio', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.capped-tubes-selection-option'),
        }),
      );
      await click(
        screen.getByRole('button', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.add-new-tubes-selection'),
        }),
      );

      //then
      assert.ok(
        screen.getByRole('heading', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.capped-tubes-criteria'),
        }),
      );
      assert.ok(
        screen.getByRole('textbox', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.description'),
        }),
      );
      assert.ok(screen.queryByLabelText('Taux de réussite requis', { exact: false }));
    });

    test('it should display tubes from selected target profiles', async function (assert) {
      const model = {
        attestations,
        blueprint,
      };

      //when
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

      await selectOption(screen, t('components.combined-course-blueprints.attestation.select-label'), 'Parentalite');

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );

      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        2,
      );

      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      await click(
        screen.getByRole('radio', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.capped-tubes-selection-option'),
        }),
      );

      await click(
        screen.getByRole('button', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.add-new-tubes-selection'),
        }),
      );

      //then
      assert.ok(screen.getByText('2 · Titre domaine 2'));
      assert.ok(screen.getByText('3 · Titre domaine 3'));

      await click(screen.getByRole('button', { name: t('components.expandable-accordions.expand-all') }));
      assert.ok(screen.getByText('@tubeName3 : Tube 3'));
      assert.ok(screen.getByText('@tubeName4 : Tube 4'));
    });

    test('it should display the whole schema criterion when the whole blueprint option is selected', async function (assert) {
      // given
      const model = { attestations, blueprint };
      const screen = await renderFormAndSelectAttestation(model);

      // when
      await click(
        screen.getByRole('radio', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.entire-blueprint-criteria-option'),
        }),
      );

      // then
      assert.ok(screen.getByLabelText('Taux de réussite requis', { exact: false }));
      assert.notOk(
        screen.queryByRole('button', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.add-new-tubes-selection'),
        }),
      );
      assert.notOk(
        screen.queryByRole('heading', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.capped-tubes-criteria'),
        }),
      );
    });

    async function renderFormAndSelectAttestation(model) {
      const screen = await render(<template><CombinedCourseBlueprintForm @model={{model}} /></template>);

      await fillIn(
        screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
        1,
      );
      await screen.findByRole('link', { name: 'super pc', exact: false });
      await click(
        screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }),
      );

      await selectOption(screen, t('components.combined-course-blueprints.attestation.select-label'), 'Parentalite');

      return screen;
    }

    test('it should display the radio button to not add criteria', async function (assert) {
      // given
      const model = { attestations, blueprint };
      const screen = await renderFormAndSelectAttestation(model);

      // when
      await click(
        screen.getByRole('radio', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.no-criteria-option'),
        }),
      );

      // then
      assert.notOk(screen.queryByLabelText('Taux de réussite requis', { exact: false }));
      assert.notOk(
        screen.queryByRole('button', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.add-new-tubes-selection'),
        }),
      );
      assert.notOk(
        screen.queryByRole('heading', {
          name: t('components.combined-course-blueprints.labels.reward-requirements.capped-tubes-criteria'),
        }),
      );
    });
  });

  module('edition mode', function () {
    test('it should display reward requirements when reward exists', async function (assert) {
      // given
      const blueprint = {
        id: '1',
        name: 'name',
        internalName: 'internalName',
        attestationLabel: 'Label',
        rewardRequirementsDescription: 'Atteindre tel niveau sur tel sujet',
      };
      const model = { blueprint };

      //when
      const screen = await render(
        <template><CombinedCourseBlueprintForm @updateMode={{true}} @model={{model}} /></template>,
      );

      //then
      assert
        .dom(
          screen.getByRole('textbox', {
            name: t('components.combined-course-blueprints.labels.reward-requirements.description'),
          }),
        )
        .hasValue('Atteindre tel niveau sur tel sujet');
    });
  });
});
