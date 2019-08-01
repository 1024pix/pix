import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | navbar-header', function() {

  setupRenderingTest();

  context('when user is not logged', function() {
    beforeEach(function() {
      this.owner.register('service:session', Service.extend({ isAuthenticated: false }));
    });

    it('should be rendered', async function() {
      // when
      await render(hbs`{{navbar-header}}`);
      // then
      expect(find('.navbar-header')).to.exist;
    });
  });

  context('When user is logged', function() {
    beforeEach(function() {
      this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
    });

    it('should be rendered', async function() {
      // when
      await render(hbs`{{navbar-header}}`);
      // then
      expect(find('.navbar-header')).to.exist;
    });
  });
});
