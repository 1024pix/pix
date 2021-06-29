import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Campaigns | details', function(hooks) {
  setupRenderingTest(hooks);

  test('should display campaign attributes', async function(assert) {
    // given
    this.campaign = {
      id: 1,
      name: 'My campaign',
      type: 'ASSESSMENT',
      code: 'MYCODE',
      creatorFirstName: 'Jon',
      creatorLastName: 'Snow',
      organizationId: 2,
      organizationName: 'My organization',
      targetProfileId: 3,
      targetProfileName: 'My target profile',
      createdAt: new Date('2020-02-01'),
      archivedAt: new Date('2020-03-01'),
    };

    // when
    await render(hbs`<Campaigns::Details @campaign={{this.campaign}} />`);

    // expect
    assert.contains('My campaign');
    assert.contains('Créée le 01/02/2020 par Jon Snow');
    assert.contains('Type : Évaluation');
    assert.contains('Code : MYCODE');
    assert.contains('My target profile');
    assert.contains('Archivée le 01/03/2020');
  });

  test('should display profile collection tag', async function(assert) {
    // given
    this.campaign = {
      id: 1,
      name: 'My campaign',
      type: 'COLLECTION_PROFILE',
    };

    // when
    await render(hbs`<Campaigns::Details @campaign={{this.campaign}} />`);

    // expect
    assert.contains('Collecte de profils');
  });
});
