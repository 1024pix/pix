import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import sinon from 'sinon';
import { render } from '@ember/test-helpers';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Campaigns | details', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.toggleEditMode = sinon.stub();
  });

  test('should display campaign attributes', async function (assert) {
    // given
    this.campaign = {
      type: 'ASSESSMENT',
      code: 'MYCODE',
      creatorFirstName: 'Jon',
      creatorLastName: 'Snow',
      organizationId: 2,
      organizationName: 'My organization',
      targetProfileId: 3,
      targetProfileName: 'My target profile',
      customLandingPageText: 'welcome',
      customResultPageText: 'tadaaa',
      customResultPageButtonText: 'Click here',
      customResultPageButtonUrl: 'www.pix.fr',
      createdAt: new Date('2020-02-01'),
      archivedAt: new Date('2020-03-01'),
    };

    // when
    await render(hbs`<Campaigns::Details @campaign={{this.campaign}} @toggleEditMode={{this.toggleEditMode}} />`);

    // expect
    assert.contains('Créée le 01/02/2020 par Jon Snow');
    assert.contains('Type : Évaluation');
    assert.contains('Code : MYCODE');
    assert.contains('My target profile');
    assert.contains('My organization');
    assert.contains('Archivée le 01/03/2020');
    assert.contains('welcome');
    assert.contains('tadaaa');
    assert.contains('Click here');
    assert.contains('www.pix.fr');
  });

  test('should display profile collection tag', async function (assert) {
    // given
    this.campaign = {
      type: 'COLLECTION_PROFILE',
    };

    // when
    await render(hbs`<Campaigns::Details @campaign={{this.campaign}} @toggleEditMode={{this.toggleEditMode}} />`);

    // expect
    assert.contains('Collecte de profils');
  });

  test('should call toggleEditMode function when the edit button is clicked', async function (assert) {
    this.campaign = {};

    //when
    await render(hbs`<Campaigns::Details @campaign={{this.campaign}} @toggleEditMode={{this.toggleEditMode}} />`);
    await clickByLabel('Editer');

    //then
    assert.ok(this.toggleEditMode.called);
  });
});
