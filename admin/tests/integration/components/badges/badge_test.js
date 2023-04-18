import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

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
      areas: [],
    });
    const criterionCampaignParticipation = store.createRecord('badge-criterion', {
      id: 123,
      threshold: 25,
      scope: 'CampaignParticipation',
      cappedTubes: [],
    });
    const criterionCappedTubes = store.createRecord('badge-criterion', {
      id: 456,
      threshold: 95,
      scope: 'CappedTubes',
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
      'L‘évalué doit obtenir 25% sur l‘ensemble des sujets du profil cible.'
    );
    assert.deepEqual(
      screen.getByTestId('toujourstriste').innerText,
      "L'évalué doit obtenir 95% sur tous les sujets plafonnés par niveau suivants :"
    );
  });
});
