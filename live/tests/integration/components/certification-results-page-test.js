import { computed } from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import LinkComponent from '@ember/routing/link-component';

describe('Integration | Component | certification results template', function() {
  setupComponentTest('certification-results-page', {
    integration: true
  });

  context('When component is rendered', function() {
    const user = { id: 5, firstName: 'shi', lastName: 'fu' };
    beforeEach(function() {
      this.set('user', user);
    });

    it('should also render a certification banner', function() {
      // when
      this.render(hbs`{{certification-results-page user=user}}`);

      // then
      expect(this.$('.certification-banner')).to.have.lengthOf(1);
      expect(this.$('.certification-banner__container .certification-banner__user-fullname')).to.have.lengthOf(1);
      expect(this.$('.certification-banner__container .certification-banner__user-fullname').text().trim()).to.equal(`${user.firstName} ${user.lastName}`);
      expect(this.$('.certification-banner__container .certification-banner__user-id').text().trim()).to.equal(`#${user.id}`);
    });

    it('should have a button to logout', function() {
      // given
      LinkComponent.reopen({
        href: computed.alias('qualifiedRouteName')
      });

      // when
      this.render(hbs`{{certification-results-page user=user}}`);

      // then
      expect(this.$('.warning-logout-button')).to.have.lengthOf(1);
      expect(this.$('.warning-logout-button').attr('href')).to.equal('logout');
    });
  });
});
