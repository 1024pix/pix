import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../helpers/create-glimmer-component';
import setupIntl from '../../helpers/setup-intl';

module('Unit | Component | register-form', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#searchForMatchingStudent', function () {
    module('completes successfully', function () {
      test('retrieves matching sco organization learner', async function (assert) {
        // given
        const eventStub = { preventDefault: sinon.stub() };
        const campaignCode = 'SCO789';
        const component = createGlimmerComponent('routes/register-form', { campaignCode });

        component.firstName = 'Lili';
        component.lastName = 'Coptère';
        component.monthOfBirth = '05';
        component.yearOfBirth = '2002';
        component.dayOfBirth = '02';

        const scoOrganizationLearnerSaveStub = sinon.stub();
        const dependentUserSaveStub = sinon.stub();
        const createdScoOrganizationLearner = { username: 'lilicoptere0205' };
        scoOrganizationLearnerSaveStub.resolves(createdScoOrganizationLearner);
        dependentUserSaveStub.resolves();

        class storeStub extends Service {
          createRecord = sinon
            .stub()
            .onFirstCall()
            .returns({
              username: 'lilicoptere0205',
              save: scoOrganizationLearnerSaveStub,
              unloadRecord: sinon.stub().resolves(),
            })
            .onSecondCall()
            .returns({
              save: dependentUserSaveStub,
            });
        }

        this.owner.register('service:store', storeStub);

        component.scoOrganizationLearner = scoOrganizationLearnerSaveStub;
        component.dependentUser = dependentUserSaveStub;

        // when
        await component.searchForMatchingStudent(eventStub);

        // then
        sinon.assert.called(scoOrganizationLearnerSaveStub);
        assert.strictEqual(component.username, 'lilicoptere0205');
        assert.true(component.matchingStudentFound);
        assert.false(component.isSearchFormNotValid);
        assert.false(component.isLoading);
        assert.strictEqual(component.scoOrganizationLearner.username, component.username);
        assert.strictEqual(component.errorMessage, null);
      });
    });

    module('completes with error', function () {
      test('displays error message', async function (assert) {
        // given
        const eventStub = { preventDefault: sinon.stub() };
        const campaignCode = 'SCO789';
        const unloadRecordStub = sinon.stub();
        const component = createGlimmerComponent('routes/register-form', { campaignCode });
        component.firstName = 'Lili';
        component.lastName = 'Coptère';
        component.monthOfBirth = '05';
        component.yearOfBirth = '2002';
        component.dayOfBirth = '02';

        const scoOrganizationLearnerSaveStub = sinon.stub().returns({
          save: sinon.stub().rejects({
            errors: [{ status: '409', meta: { shortCode: 'S50', message: 'api-error-messages.register-error.s50' } }],
          }),
          unloadRecord: unloadRecordStub,
        });

        const createRecordStub = scoOrganizationLearnerSaveStub;
        component.store = {
          createRecord: createRecordStub,
        };

        component.scoOrganizationLearner = scoOrganizationLearnerSaveStub;

        // when
        await component.searchForMatchingStudent(eventStub);

        // then
        sinon.assert.called(unloadRecordStub);
        assert.false(component.matchingStudentFound);
        assert.false(component.isLoading);
        assert.strictEqual(component.errorMessage, this.intl.t('api-error-messages.register-error.s50'));
      });
    });

    module('while waiting for submission completion', function () {
      test('isLoading true', async function (assert) {
        // given
        let inflightLoading;
        const campaignCode = 'SCO789';
        const eventStub = { preventDefault: sinon.stub() };

        const component = createGlimmerComponent('routes/register-form', { campaignCode });
        component.firstName = 'Lili';
        component.lastName = 'Coptère';
        component.monthOfBirth = '05';
        component.yearOfBirth = '2002';
        component.dayOfBirth = '02';

        const saveStub = function () {
          inflightLoading = component.isLoading;
          return Promise.resolve({ username: 'lilicoptere0205' });
        };

        const scoOrganizationLearnerSaveStub = sinon.stub().returns({ save: saveStub });

        const createRecordStub = scoOrganizationLearnerSaveStub;
        component.store = {
          createRecord: createRecordStub,
        };

        component.scoOrganizationLearner = scoOrganizationLearnerSaveStub;

        // when
        await component.searchForMatchingStudent(eventStub);

        // then
        assert.true(inflightLoading);
      });
    });
  });

  module('#register', function () {
    module('completes successfully', function () {
      test('registers and authenticates user with username', async function (assert) {
        // given
        const eventStub = { preventDefault: sinon.stub() };
        const store = this.owner.lookup('service:store');
        const createdDependentUser = store.createRecord('dependent-user', {
          save: sinon.stub(),
        });

        const component = createGlimmerComponent('routes/register-form');

        component.dependentUser = createdDependentUser;
        component.password = 'Password12345!';
        component.username = 'lilicoptere0205';

        const authenticateStub = sinon.stub();

        class SessionStub extends Service {
          authenticate = authenticateStub;
        }
        this.owner.register('service:session', SessionStub);

        // when
        await component.register(eventStub);

        // then
        sinon.assert.calledWith(authenticateStub, 'authenticator:oauth2', {
          login: component.username,
          password: component.password,
          scope: 'mon-pix',
        });
        sinon.assert.called(createdDependentUser.save);

        assert.true(component.loginWithUsername);
        assert.false(component.isCreationFormNotValid);
        assert.false(component.isLoading);
        assert.strictEqual(component.dependentUser.password, null);
        assert.strictEqual(component.dependentUser.username, component.username);
      });
    });

    module('completes with error', function () {
      test('displays error message', async function (assert) {
        // given
        const eventStub = { preventDefault: sinon.stub() };
        const store = this.owner.lookup('service:store');
        const createdDependentUser = store.createRecord('dependent-user', {
          save: sinon.stub().rejects({
            errors: [{ status: '409', meta: { shortCode: 'S50', message: 'api-error-messages.register-error.s50' } }],
          }),
        });

        const component = createGlimmerComponent('routes/register-form');

        component.dependentUser = createdDependentUser;
        component.password = 'Password12345!';
        component.username = 'lilicoptere0205';

        const authenticateStub = sinon.stub();

        class SessionStub extends Service {
          authenticate = authenticateStub;
        }
        this.owner.register('service:session', SessionStub);

        // when
        await component.register(eventStub);

        // then
        sinon.assert.notCalled(authenticateStub);

        assert.false(component.isCreationFormNotValid);
        assert.false(component.isLoading);
        assert.ok(component.displayRegisterErrorMessage);
        assert.strictEqual(component.registerErrorMessage, this.intl.t('api-error-messages.register-error.s50'));
      });
    });

    module('while waiting for submission completion', function () {
      test('isloading true', async function (assert) {
        // given
        let inflightLoading;
        const eventStub = { preventDefault: sinon.stub() };
        const store = this.owner.lookup('service:store');
        const createdDependentUser = store.createRecord('dependent-user', {
          save: sinon.stub(),
        });

        const component = createGlimmerComponent('routes/register-form');

        component.dependentUser = createdDependentUser;
        component.password = 'Password12345!';
        component.username = 'lilicoptere0205';

        const authenticateStub = function () {
          inflightLoading = component.isLoading;
          return Promise.resolve();
        };

        class SessionStub extends Service {
          authenticate = authenticateStub;
        }
        this.owner.register('service:session', SessionStub);

        // when
        await component.register(eventStub);

        // then
        assert.true(inflightLoading);
      });
    });
  });

  module('#resetForm', function () {
    module('when click on "It\'s not me"', function () {
      test('should reset register form', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const unloadRecordStub = sinon.stub();
        store.createRecord('sco-organization-learner', { unloadRecord: unloadRecordStub });
        store.createRecord('dependent-user', { unloadRecord: unloadRecordStub });

        const component = createGlimmerComponent('routes/register-form');
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
