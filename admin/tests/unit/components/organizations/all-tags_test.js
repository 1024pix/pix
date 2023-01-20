import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | organizations/all-tags', function (hooks) {
  setupTest(hooks);

  module('when clicking on a tag', function () {
    module('when the tag is not yet associated to the organization', function () {
      test('it associates the tag to the organization and show recently used tags', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const tag = store.createRecord('tag', { name: 'TAG1' });
        const recentlyUsedTag = store.createRecord('tag', { name: 'TAG2' });
        const saveStub = sinon.stub().resolves();
        const organization = store.createRecord('organization', { tags: [], save: saveStub });
        const component = createGlimmerComponent('component:organizations/all-tags', {
          model: {
            organization,
            allTags: [tag, recentlyUsedTag],
          },
        });

        store.query = sinon.stub().resolves([recentlyUsedTag]);

        component.store = store;

        // when
        await component.addTagToOrganization(tag);

        // then
        sinon.assert.calledOnce(saveStub);
        assert.strictEqual(component.args.model.organization.tags.length, 1);
        sinon.assert.calledOnce(store.query);
        assert.strictEqual(component.selectedTag.name, tag.name);
        assert.strictEqual(component.recentlyUsedTags.length, 1);
      });
    });

    module('when the tag is associated to the organization', function () {
      test('it disassociates the tag from the organization', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const tag1 = store.createRecord('tag', { name: 'TAG1' });
        const tag2 = store.createRecord('tag', { name: 'TAG2' });
        const saveStub = sinon.stub().resolves();
        const organizationTags = [tag1, tag2];
        const organization = store.createRecord('organization', { tags: organizationTags, save: saveStub });
        const component = createGlimmerComponent('component:organizations/all-tags', {
          model: {
            organization,
            allTags: [tag1, tag2],
          },
        });

        component.store = store;
        component.selectedTag = tag1;
        component.recentlyUsedTags = [tag2];

        // when
        await component.removeTagToOrganization(tag2);

        console.log(component);

        // then
        sinon.assert.calledOnce(saveStub);
        assert.strictEqual(component.args.model.organization.tags.length, 1);
        assert.strictEqual(component.selectedTag, null);
        assert.strictEqual(component.recentlyUsedTags, null);
      });
    });
  });
});
