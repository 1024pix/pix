import { run } from '@ember/runloop';
import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | pix content backdrop', function() {
  setupComponentTest('pix-content-backdrop', {
    integration: true
  });

  beforeEach(function() {
    this.register('service:side-menu', Service.extend({
      close() {
      }
    }));
    this.inject.service('side-menu', { as: 'sideMenu' });
  });

  it('should be rendered', function() {
    // when
    this.render(hbs`{{pix-content-backdrop}}`);

    // then
    expect(this.$()).to.have.length(1);
  });

  describe('@touchStart', function() {
    it('should close the side-menu', function() {
      // given
      this.set('sideMenu.progress', 10);
      this.render(hbs`{{content-backdrop}}`);

      // when
      run(() => document.querySelector('.content-backdrop').click());

      // then
      expect(this.$('.content-backdrop').attr('style').indexOf('visibility: hidden') > -1);
    });
  });
});
