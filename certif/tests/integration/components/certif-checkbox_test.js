import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import sinon from 'sinon';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certif-checkbox', function(hooks) {
  setupRenderingTest(hooks);

  [
    { state: 'checked', classes: ['checkbox--checked'] },
    { state: 'partial', classes: ['checkbox--unchecked', 'checkbox--partial'] },
    { state: 'unchecked', classes: ['checkbox--unchecked'] },
  ].forEach(({ state, classes }) =>
    test(`it renders a checkbox in ${state} with the class '${classes.join(',')}'`, async function(assert) {
      // given
      const fakeFunc = sinon.spy();
      this.set('fakeFunc', fakeFunc);
      this.set('state', state);
      await render(hbs`<CertifCheckbox @state={{state}} {{on 'click' (fn fakeFunc)}}></CertifCheckbox>`);

      // when
      await click('.checkbox');

      // then
      classes.forEach((cssClass) => assert.dom('.checkbox').hasClass(cssClass));
      sinon.assert.calledOnce(fakeFunc);
    }));

});
