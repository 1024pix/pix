import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { clickByName, render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Integration | Component | organizations/all-tags', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of inactive and active tags', async function (assert) {
    // given
    const tag1 = EmberObject.create({ id: 1, name: 'MEDNUM' });
    const tag2 = EmberObject.create({ id: 2, name: 'AEFE' });
    const organizationTag1 = EmberObject.create({ name: 'MEDNUM' });
    const organization = EmberObject.create({ tags: [organizationTag1] });

    this.set('model', { organization, allTags: [tag1, tag2] });

    // when
    const screen = await render(hbs`<Organizations::AllTags @model={{this.model}} />`);

    // then
    assert.dom(screen.getByRole('button', { name: "Tag MEDNUM assigné à l'organisation" })).exists();
    assert.dom(screen.getByRole('button', { name: "Tag AEFE non assigné à l'organisation" })).exists();
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
    const screen = await render(hbs`<Organizations::AllTags @model={{this.model}} />`);

    // then
    assert.dom(screen.getAllByRole('button')[0]).hasText('AEFE');
    assert.dom(screen.getAllByRole('button')[3]).hasText('POLE EMPLOI');
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
        await clickByName("Tag AGRICULTURE non assigné à l'organisation");

        // then
        assert.ok(save.called);
        assert.strictEqual(this.model.organization.tags.length, 1);
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
        await clickByName("Tag MEDNUM assigné à l'organisation");

        // then
        assert.ok(save.called);
        assert.strictEqual(this.model.organization.tags.length, 0);
      });
    });
  });
});
