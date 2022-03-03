import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, click } from '@ember/test-helpers';
import { fillByLabel, render } from '@1024pix/ember-testing-library';
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
    assert.dom('.page-section__details').exists();
    const detailsContent = find('.page-section__details').textContent;
    assert.ok(detailsContent.match(badge.title), 'title');
    assert.ok(detailsContent.match(badge.key), 'key');
    assert.ok(detailsContent.match(badge.message), 'message');
    assert.ok(detailsContent.match(badge.id), 'id');
    assert.ok(detailsContent.match(badge.altMessage), 'altMessage');
    assert.ok(detailsContent.match('Certifiable'), 'Certifiable');
    assert.dom('.page-section__details img').exists();
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
      await click('button[type="button"]');
      await fillByLabel('* Titre :', 'mon titre mis à jour');
      await fillByLabel('* Clé :', 'ma clef mise à jour');
      await fillByLabel('Message :', 'mon message mis à jour');
      await fillByLabel('* Message Alternatif :', 'mon message alternatif mis à jour');
      await fillByLabel("* Nom de l'image (svg) :", 'mon url image mise à jour');
      await fillByLabel('Certifiable :', false);
      await fillByLabel('Lacunes :', true);
      await click('button[type="submit"]');

      // then
      sinon.assert.calledWith(findRecordStub, 'badge', badge.id);
      sinon.assert.calledOnce(saveStub);
      assert.ok(true);
    });
  });
});
