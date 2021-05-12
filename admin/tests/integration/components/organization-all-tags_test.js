import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | organization-all-tags', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of tags', async function(assert) {
    // given
    const tag1 = EmberObject.create({ id: 1, name: 'MEDNUM' });
    const tag2 = EmberObject.create({ id: 2, name: 'AEFE' });
    const organizationTag1 = EmberObject.create({ name: 'MEDNUM' });

    this.set('allOrganizationTags', { allTags: [tag1, tag2], organizationTags: [organizationTag1] });

    // when
    await render(hbs`<OrganizationAllTags @model={{this.allOrganizationTags}} />`);

    // then
    assert.contains('MEDNUM');
    assert.contains('AEFE');
  });

  test('it should display an active tag when it is associate to an organization', async function(assert) {
    // given
    const tag1 = EmberObject.create({ id: 1, name: 'MEDNUM' });
    const organizationTag1 = EmberObject.create({ name: 'MEDNUM' });

    this.set('allOrganizationTags', { allTags: [tag1], organizationTags: [organizationTag1] });

    // when
    await render(hbs`<OrganizationAllTags @model={{this.allOrganizationTags}} />`);

    // then
    assert.dom('.pix-tag--purple-light').exists();
  });

  test('it should display an inactive tag when it is not associate to an organization', async function(assert) {
    // given
    const tag1 = EmberObject.create({ id: 1, name: 'MEDNUM' });

    this.set('allOrganizationTags', { allTags: [tag1], organizationTags: [] });

    // when
    await render(hbs`<OrganizationAllTags @model={{this.allOrganizationTags}} />`);

    // then
    assert.dom('.pix-tag--grey-light').exists();
  });
});
