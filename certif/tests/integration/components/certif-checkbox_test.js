import { module, test } from 'qunit';
import sinon from 'sinon';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | certif-checkbox', function (hooks) {
  setupIntlRenderingTest(hooks);

  [
    { state: 'checked', classes: ['checkbox--checked'] },
    { state: 'partial', classes: ['checkbox--unchecked', 'checkbox--partial'] },
    { state: 'unchecked', classes: ['checkbox--unchecked'] },
  ].forEach(({ state, classes }) =>
    test(`it renders a checkbox in ${state} with the class '${classes.join(',')}'`, async function (assert) {
      // given
      const fakeFunc = sinon.spy();
      this.set('fakeFunc', fakeFunc);
      this.set('state', state);
      await render(hbs`<CertifCheckbox @state={{this.state}} {{on 'click' (fn this.fakeFunc)}}></CertifCheckbox>`);

      // when
      await click('.checkbox');

      // then
      classes.forEach((cssClass) => assert.dom('.checkbox').hasClass(cssClass));
      sinon.assert.calledOnce(fakeFunc);
    })
  );
});
