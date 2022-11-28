import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillByLabel, render, clickByName } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Integration | Component | Badges::Badge', function (hooks) {
  setupRenderingTest(hooks);

  test('should render all details about the badge', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const badge = store.createRecord('badge', {
      id: 42,
      title: 'mon titre',
      message: 'mon message',
      imageUrl: 'data:,',
      key: 'ma clef',
      altMessage: 'mon message alternatif',
      isCertifiable: true,
      isAlwaysVisible: true,
      criteria: [],
    });
    this.set('badge', badge);

    // when
    const screen = await render(hbs`<Badges::Badge @badge={{this.badge}} />`);

    // then
    assert.dom(screen.getByText(`ID : ${badge.id}`)).exists();
    assert.dom(screen.getByText(`Nom du résultat thématique : ${badge.title}`)).exists();
    assert.dom(screen.getByText(`Message : ${badge.message}`)).exists();
    assert.dom(screen.getByText(`Clé : ${badge.key}`)).exists();
    assert.dom(screen.getByText(`Message alternatif : ${badge.altMessage}`)).exists();
    assert.dom(screen.getByText('Certifiable')).exists();
    assert.dom(screen.getByText('Lacunes')).exists();
    assert.dom(screen.getByRole('presentation')).exists();
  });

  test('should render all criteria', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const targetProfile = store.createRecord('target-profile', {
      newAreas: [],
    });
    const criterionCampaignParticipation = store.createRecord('badge-criterion', {
      id: 123,
      threshold: 25,
      scope: 'CampaignParticipation',
      skillSets: [],
      cappedTubes: [],
    });
    const criterionCappedTubes = store.createRecord('badge-criterion', {
      id: 456,
      threshold: 95,
      scope: 'CappedTubes',
      skillSets: [],
      cappedTubes: [],
    });
    const badge = store.createRecord('badge', {
      id: 42,
      title: 'mon titre',
      message: 'mon message',
      imageUrl: 'data:,',
      key: 'ma clef',
      altMessage: 'mon message alternatif',
      isCertifiable: true,
      isAlwaysVisible: true,
      criteria: [criterionCampaignParticipation, criterionCappedTubes],
    });
    this.set('badge', badge);
    this.set('targetProfile', targetProfile);

    // when
    const screen = await render(hbs`<Badges::Badge @badge={{this.badge}} @targetProfile={{this.targetProfile}} />`);

    // then
    assert.deepEqual(
      screen.getByTestId('triste').innerText,
      'L‘évalué doit obtenir 25% sur l‘ensemble des acquis du profil-cible.'
    );
    assert.deepEqual(
      screen.getByTestId('toujourstriste').innerText,
      "L'évalué doit obtenir 95% sur tous les sujets plafonnés par niveau suivants :"
    );
  });

  module('#updateBadge', function () {
    test('should send badge update request to api', async function (assert) {
      // given
      const tube = EmberObject.create({
        id: 1,
        practicalTitle: 'Mon tube',
      });
      const skill = EmberObject.create({
        id: 1,
        name: '@skill2',
        difficulty: 2,
        tube,
      });
      tube.skills = [skill];
      const badge = EmberObject.create({
        id: 42,
        title: 'mon titre',
        message: 'mon message',
        imageUrl: 'data:,',
        key: 'ma clef',
        altMessage: 'mon message alternatif',
        isCertifiable: true,
        badgeCriteria: [
          EmberObject.create({
            id: 1,
            scope: 'CampaignParticipation',
            threshold: 85,
            skillSets: [EmberObject.create({ id: 1, name: 'Competence', color: 'red', skills: [skill] })],
          }),
        ],
      });

      this.set('badge', badge);
      const store = this.owner.lookup('service:store');
      const findRecordStub = sinon.stub();
      const saveStub = sinon.stub().resolves();
      findRecordStub.returns({ save: saveStub });
      store.findRecord = findRecordStub;

      await render(hbs`<Badges::Badge @badge={{this.badge}} />`);

      // when
      await clickByName('Éditer');
      await fillByLabel('* Titre :', 'mon titre mis à jour');
      await fillByLabel('* Clé :', 'ma clef mise à jour');
      await fillByLabel('Message :', 'mon message mis à jour');
      await fillByLabel('* Message Alternatif :', 'mon message alternatif mis à jour');
      await fillByLabel("* Nom de l'image (svg) :", 'mon url image mise à jour');
      await fillByLabel('Certifiable :', false);
      await fillByLabel('Lacunes :', true);
      await clickByName('Enregistrer');

      // then
      sinon.assert.calledWith(findRecordStub, 'badge', badge.id);
      sinon.assert.calledOnce(saveStub);
      assert.ok(true);
    });
  });
});
