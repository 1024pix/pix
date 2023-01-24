import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | register-form', function (hooks) {
  setupTest(hooks);

  module('#resetForm', function () {
    module('when click on "It\'s not me"', function () {
      test('should reset register form', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const unloadRecordStub = sinon.stub();
        store.createRecord('sco-organization-learner', { unloadRecord: unloadRecordStub });
        store.createRecord('dependent-user', { unloadRecord: unloadRecordStub });
        const component = createGlimmerComponent('component:routes/register-form');
        component.firstName = 'Lili';
        component.lastName = 'Coptère';
        component.monthOfBirth = '05';
        component.yearOfBirth = '2002';
        component.dayOfBirth = '02';
        component.email = 'lili.coptere@ciel.clair';
        component.username = 'lilicoptere0205';
        component.matchingStudentFound = true;
        component.loginWithUsername = false;

        // when
        await component.resetForm();

        // then
        assert.strictEqual(component.firstName, null);
        assert.strictEqual(component.lastName, null);
        assert.strictEqual(component.monthOfBirth, null);
        assert.strictEqual(component.yearOfBirth, null);
        assert.strictEqual(component.dayOfBirth, null);
        assert.strictEqual(component.email, null);
        assert.strictEqual(component.username, null);
        assert.strictEqual(component.password, null);
        assert.strictEqual(component.errorMessage, null);
        assert.false(component.matchingStudentFound);
        assert.true(component.loginWithUsername);
      });
    });
  });
});
