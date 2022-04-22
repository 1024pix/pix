import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillByLabel, render, clickByName } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Integration | Component | Badges::Badge', function (hooks) {
  let badge;
  let skill;

  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const tube = EmberObject.create({
      id: 1,
      practicalTitle: 'Mon tube',
    });
    skill = EmberObject.create({
      id: 1,
      name: '@skill2',
      difficulty: 2,
      tube,
    });
    tube.skills = [skill];

    badge = EmberObject.create({
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
  });

  test('should render all details about the badge', async function (assert) {
    //when
    const screen = await render(hbs`<Badges::Badge @badge={{this.badge}} />`);

    //then
    assert.dom(screen.getByText(`ID : ${badge.id}`)).exists();
    assert.dom(screen.getByText(`Nom du badge : ${badge.title}`)).exists();
    assert.dom(screen.getByText(`Message : ${badge.message}`)).exists();
    assert.dom(screen.getByText(`Clé : ${badge.key}`)).exists();
    assert.dom(screen.getByText(`Message alternatif : ${badge.altMessage}`)).exists();
    assert.dom(screen.getByText('Certifiable')).exists();
    assert.dom(screen.getByRole('presentation')).exists();
    assert.dom(screen.getByText('85%')).exists();
    assert
      .dom(screen.getByText('L‘évalué doit obtenir sur l‘ensemble des acquis du target profile', { exact: false }))
      .exists();
    assert.dom(screen.getByText('Competence')).exists();
    assert.dom(screen.getByLabelText('@skill2')).exists();
    assert.dom(screen.getByText('Mon tube')).exists();
  });

  module('#updateBadge', function () {
    test('should send badge update request to api', async function (assert) {
      // given
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
