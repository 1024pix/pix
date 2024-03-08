import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | organizations/children/attach-child-form', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:organizations/children/attach-child-form');
  });

  module('when form input value changes', function () {
    test('updates "childOrganization" component attribute', function (assert) {
      // given
      const event = { target: { value: '5432' } };

      // when
      component.childOrganizationInputValueChanged(event);

      // then
      assert.strictEqual(component.childOrganization, '5432');
    });
  });

  module('when submitting the form', function () {
    test('emits an event with "childOrganization" component attribute value and resets form input', function (assert) {
      // given
      const onFormSubmitted = sinon.stub();
      const event = { preventDefault: sinon.stub() };

      component.childOrganization = '1234';
      component.args.onFormSubmitted = onFormSubmitted;

      // when
      component.submitForm(event);

      // then
      assert.true(event.preventDefault.calledOnce);
      assert.true(onFormSubmitted.calledOnceWithExactly('1234'));
      assert.strictEqual(component.childOrganization, '');
    });
  });
});
