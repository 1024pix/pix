import EmberObject from '@ember/object';
import PixApplicationRouteMixinMixin from 'pix-admin/mixins/pix-application-route-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | pix application route mixin');

// Replace this with your real tests.
test('it works', function(assert) {
  let PixApplicationRouteMixinObject = EmberObject.extend(PixApplicationRouteMixinMixin);
  let subject = PixApplicationRouteMixinObject.create();
  assert.ok(subject);
});
