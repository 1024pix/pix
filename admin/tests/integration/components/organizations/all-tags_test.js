import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import sinon from 'sinon';

module('Integration | Component | organizations/all-tags', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of tags', async function (assert) {
    // given
    const tag1 = EmberObject.create({ id: 1, name: 'MEDNUM' });
    const tag2 = EmberObject.create({ id: 2, name: 'AEFE' });
    const organizationTag1 = EmberObject.create({ name: 'MEDNUM' });
    const organization = EmberObject.create({ tags: [organizationTag1] });

    this.set('model', { organization, allTags: [tag1, tag2] });

    // when
    await render(hbs`<Organizations::AllTags @model={{this.model}} />`);

    // then
    assert.contains('MEDNUM');
    assert.contains('AEFE');
  });

  test('it should display tags in alphabetical order', async function (assert) {
    // given
    const tag1 = EmberObject.create({ id: 1, name: 'MEDNUM' });
    const tag2 = EmberObject.create({ id: 2, name: 'AEFE' });
    const tag3 = EmberObject.create({ id: 3, name: 'CFA' });
    const tag4 = EmberObject.create({ id: 4, name: 'POLE EMPLOI' });
    const organization = EmberObject.create({ tags: [] });

    this.set('model', { organization, allTags: [tag1, tag2, tag3, tag4] });

    // when
    await render(hbs`<Organizations::AllTags @model={{this.model}} />`);

    // then
    assert.dom('.organization-all-tags-list__tag:first-child .pix-tag').containsText('AEFE');
    assert.dom('.organization-all-tags-list__tag:last-child .pix-tag').containsText('POLE EMPLOI');
  });

  test('it should display an active tag when it is associate to an organization', async function (assert) {
    // given
    const tag1 = EmberObject.create({ id: 1, name: 'MEDNUM' });
    const organizationTag1 = EmberObject.create({ name: 'MEDNUM' });
    const organization = EmberObject.create({ tags: [organizationTag1] });

    this.set('model', { organization, allTags: [tag1] });

    // when
    await render(hbs`<Organizations::AllTags @model={{this.model}} />`);

    // then
    assert.dom('.pix-tag--purple-light').exists();
  });

  test('it should display an inactive tag when it is not associate to an organization', async function (assert) {
    // given
    const tag1 = EmberObject.create({ id: 1, name: 'MEDNUM' });
    const organization = EmberObject.create({ tags: [] });

    this.set('model', { organization, allTags: [tag1] });

    // when
    await render(hbs`<Organizations::AllTags @model={{this.model}} />`);

    // then
    assert.dom('.pix-tag--grey-light').exists();
  });

  module('when clicking on a tag', () => {
    module('when the tag is not yet associated to the organization', () => {
      test('it should associate the tag to the organization', async function (assert) {
        // given
        const tag1 = EmberObject.create({ id: 1, name: 'MEDNUM' });
        const tag2 = EmberObject.create({ id: 2, name: 'AGRICULTURE' });
        const save = sinon.stub();
        const organization = EmberObject.create({ tags: [], save });
        this.set('model', { organization, allTags: [tag1, tag2] });

        // when
        await render(hbs`<Organizations::AllTags @model={{this.model}} />`);
        await clickByLabel('AGRICULTURE');

        // then
        assert.ok(save.called);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(this.model.organization.tags.length, 1);
      });
    });

    module('when the tag is already associated to the organization', () => {
      test('it should disassociate the tag to the organization', async function (assert) {
        // given
        const tag1 = EmberObject.create({ id: 1, name: 'MEDNUM' });
        const tag2 = EmberObject.create({ id: 2, name: 'AGRICULTURE' });
        const save = sinon.stub();
        const organization = EmberObject.create({ tags: [tag1], save });
        this.set('model', { organization, allTags: [tag1, tag2] });

        // when
        await render(hbs`<Organizations::AllTags @model={{this.model}} />`);
        await clickByLabel('MEDNUM');

        // then
        assert.ok(save.called);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(this.model.organization.tags.length, 0);
      });
    });
  });
});
