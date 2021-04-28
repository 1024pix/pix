import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | Badges::Badge', function(hooks) {
  let badge;
  let skill;

  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
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
          id: 1, scope: 'CampaignParticipation', threshold: 85, partnerCompetences: [
            EmberObject.create({ id: 1, name: 'Competence', color: 'red', skills: [
              skill,
            ] }),
          ],
        }),
      ],
    });

    this.set('badge', badge);
  });

  test('should render all details about the badge', async function(assert) {
    //when
    await render(hbs`<Badges::Badge @badge={{this.badge}} />`);

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
    assert.contains('L‘évalué doit obtenir 85% sur l‘ensemble des acquis du target profile');
    assert.contains('Competence - red');
    assert.contains('@skill2');
    assert.contains('Mon tube');
  });
});
