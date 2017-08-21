import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

describe('Integration | Component | share profile', function() {
  setupComponentTest('share-profile', {
    integration: true
  });

  describe('when the organization is found', function() {

    it('should render a wrapper', function() {
      // given
      const organization = Ember.Object.create({ name: 'Université de la côte d\'Opale' });
      this.set('organization', organization);
      this.set('isShowingModal', true);

      // when
      this.render(hbs`{{share-profile isShowingModal=true organization=organization}}`);

      // then
      expect(Ember.$.find('.share-profile__modal-organization-name')[0].innerText)
        .to.equal('Université de la côte d\'Opale');
    });

  });
});
