import { module, test } from 'qunit';
import { clickByName, render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/all-tags', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display a list of inactive and active tags', async function (assert) {
    // given
    const tag1 = EmberObject.create({ id: 1, name: 'MEDNUM', isTagAssignedToOrganization: true });
    const tag2 = EmberObject.create({ id: 2, name: 'AEFE', isTagAssignedToOrganization: false });
    const organizationTag1 = EmberObject.create({ name: 'MEDNUM' });
    const organization = EmberObject.create({ tags: [organizationTag1] });

    this.set('model', { organization, allTags: [tag1, tag2] });

    // when
    const screen = await render(hbs`<Organizations::AllTags @model={{this.model}} />`);

    // then
    assert.dom(screen.getByRole('button', { name: "Tag MEDNUM assigné à l'organisation" })).exists();
    assert.dom(screen.getByRole('button', { name: "Tag AEFE non assigné à l'organisation" })).exists();
  });

  module('when clicking on a tag', () => {
    module('when the tag is not yet associated to the organization', () => {
      test('it associates the tag to the organization and displays a recently used tags list', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const tag1 = store.createRecord('tag', { name: 'MEDNUM' });
        const tag2 = store.createRecord('tag', { name: 'AGRICULTURE' });
        const recentlyUsedTag = store.createRecord('tag', { name: 'USED' });
        const saveStub = sinon.stub().resolves();
        const organization = store.createRecord('organization', { tags: [], save: saveStub });

        this.set('model', { organization, allTags: [tag1, tag2] });

        store.query = sinon.stub().resolves([recentlyUsedTag]);

        // when
        const screen = await render(hbs`<Organizations::AllTags @model={{this.model}} />`);
        await clickByName("Tag AGRICULTURE non assigné à l'organisation");

        // then
        assert.dom(screen.getByRole('button', { name: "Tag AGRICULTURE assigné à l'organisation" })).exists();
        assert
          .dom(
            screen.getByRole('heading', {
              name: this.intl.t('components.organizations.all-tags.recently-used-tags', { tagName: tag2.name }),
            })
          )
          .exists();
        assert.dom(screen.getByRole('button', { name: "Tag USED non assigné à l'organisation" })).exists();
      });
    });

    module('when the tag is already associated to the organization', () => {
      test('it disassociates the tag from the organization and removes the recently used tags list', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const tag1 = store.createRecord('tag', { name: 'MEDNUM' });
        const tag2 = store.createRecord('tag', { name: 'AGRICULTURE' });
        const recentlyUsedTag = store.createRecord('tag', { name: 'USED' });
        const saveStub = sinon.stub().resolves();
        const organization = store.createRecord('organization', { tags: [], save: saveStub });

        this.set('model', { organization, allTags: [tag1, tag2] });
        store.query = sinon.stub().resolves([recentlyUsedTag]);

        // when
        const screen = await render(hbs`<Organizations::AllTags @model={{this.model}} />`);
        await clickByName("Tag AGRICULTURE non assigné à l'organisation");
        await clickByName("Tag AGRICULTURE assigné à l'organisation");

        // then
        assert.dom(screen.getByRole('button', { name: "Tag AGRICULTURE non assigné à l'organisation" })).exists();
        assert
          .dom(
            screen.queryByRole('heading', {
              name: this.intl.t('components.organizations.all-tags.recently-used-tags', { tagName: tag2.name }),
            })
          )
          .doesNotExist();
      });
    });
  });
});
