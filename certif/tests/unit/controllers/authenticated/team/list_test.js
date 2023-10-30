import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import setupIntl from '../../../helpers/setup-intl';

module('Unit | Controller | authenticated/team/list', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let controller;
  let store;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/team/list');
    store = this.owner.lookup('service:store');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#shouldDisplayNoRefererSection', function () {
    module('when certification center has CLEA habilitation', function () {
      module('when there is a referer', function () {
        test('should return false', function (assert) {
          // given
          const referer = store.createRecord('member', {
            isReferer: true,
          });
          const notReferer = store.createRecord('member', {
            isReferer: false,
          });
          controller.model = { members: [referer, notReferer], hasCleaHabilitation: true };

          // when then
          assert.false(controller.shouldDisplayNoRefererSection);
        });
      });

      module('when there is no member', function () {
        test('should return false', function (assert) {
          // given
          controller.model = { members: [], hasCleaHabilitation: true };

          // when then
          assert.false(controller.shouldDisplayNoRefererSection);
        });
      });

      module('when there is no referer', function () {
        test('should return true', function (assert) {
          // given
          const notReferer = store.createRecord('member', {
            isReferer: false,
          });
          controller.model = { members: [notReferer], hasCleaHabilitation: true };

          // when then
          assert.true(controller.shouldDisplayNoRefererSection);
        });
      });
    });
  });

  module('#toggleRefererModal', function () {
    module('when shouldShowRefererSelectionModal is true', function () {
      test('should set the value to false', function (assert) {
        // given
        controller.shouldShowRefererSelectionModal = true;

        // when
        controller.toggleRefererModal();

        // then
        assert.false(controller.shouldShowRefererSelectionModal);
      });
    });

    module('when shouldShowRefererSelectionModal is false', function () {
      test('should set the value to true', function (assert) {
        // given
        controller.shouldShowRefererSelectionModal = false;

        // when
        controller.toggleRefererModal();

        // then
        assert.true(controller.shouldShowRefererSelectionModal);
      });
    });
  });

  module('#membersSelectOptionsSortedByLastName', function () {
    test('should return an array of non referer members select options ordered by last name', function (assert) {
      // given
      const member1 = store.createRecord('member', {
        id: 102,
        firstName: 'Abe',
        lastName: 'Sapiens',
        isReferer: false,
      });
      const member2 = store.createRecord('member', {
        id: 100,
        firstName: 'Trevor',
        lastName: 'Bruttenholm',
        isReferer: false,
      });
      const member3 = store.createRecord('member', {
        id: 101,
        firstName: 'Aby',
        lastName: 'Gails',
        isReferer: true,
      });
      controller.model = { members: [member1, member2, member3], hasCleaHabilitation: true };

      // when then
      assert.deepEqual(controller.membersSelectOptionsSortedByLastName, [
        {
          label: 'Trevor Bruttenholm',
          value: '100',
        },
        {
          label: 'Abe Sapiens',
          value: '102',
        },
      ]);
    });
  });

  module('#onSelectReferer', function () {
    test('should select the id of a selected member', function (assert) {
      // given
      const optionSelected = 102;

      // when
      controller.onSelectReferer(optionSelected);

      // then
      assert.strictEqual(controller.selectedReferer, 102);
    });
  });

  module('#onValidateReferer', function () {
    module('when a referer is selected', function () {
      test('should call updateReferer model method', function (assert) {
        // given
        const updateRefererStub = sinon.stub();
        const sendStub = sinon.stub();
        const member = store.createRecord('member', {
          id: 102,
          firstName: 'Abe',
          lastName: 'Sapiens',
          updateReferer: updateRefererStub,
        });
        controller.selectedReferer = '102';
        controller.model = { members: [member], hasCleaHabilitation: true };
        controller.send = sendStub;

        // when
        controller.onValidateReferer();

        // then
        sinon.assert.calledWith(updateRefererStub, { userId: '102', isReferer: true });
        assert.true(true);
      });
    });

    module('when there is no referer selected', function () {
      test('should not call updateReferer model method', function (assert) {
        // given
        const updateRefererStub = sinon.stub();
        const sendStub = sinon.stub();
        const member = store.createRecord('member', {
          id: 102,
          firstName: 'Abe',
          lastName: 'Sapiens',
          updateReferer: updateRefererStub,
        });
        controller.selectedReferer = '';
        controller.model = { members: [member], hasCleaHabilitation: true };
        controller.send = sendStub;

        // when
        controller.onValidateReferer();

        // then
        sinon.assert.notCalled(updateRefererStub);
        assert.true(true);
      });
    });
  });

  module('#shouldDisplayUpdateRefererButton', function (hooks) {
    let currentUser;

    hooks.beforeEach(function () {
      currentUser = this.owner.lookup('service:current-user');
    });

    module('when certification center has CLEA habilitation', function (hooks) {
      hooks.beforeEach(function () {
        controller.model = { hasCleaHabilitation: true };
      });

      module('when current user has the role "ADMIN"', function (hooks) {
        hooks.beforeEach(function () {
          sinon.stub(currentUser, 'isAdminOfCurrentCertificationCenter').value(true);
        });

        module('when there is only one member', function () {
          test('returns false', function (assert) {
            // given
            const isReferer = store.createRecord('member', {
              isReferer: true,
            });
            controller.model.members = [isReferer];

            // when then
            assert.false(controller.shouldDisplayUpdateRefererButton);
          });
        });

        module('when there is at least 2 members', function () {
          module('with a referer', function () {
            test('returns true', function (assert) {
              // given
              const notReferer = store.createRecord('member', {
                isReferer: false,
              });
              const isReferer = store.createRecord('member', {
                isReferer: true,
              });
              controller.model.members = [notReferer, isReferer];

              // when then
              assert.true(controller.shouldDisplayUpdateRefererButton);
            });
          });

          module('without referer', function () {
            test('returns false', function (assert) {
              // given
              const notReferer = store.createRecord('member', {
                isReferer: false,
              });
              const notReferer2 = store.createRecord('member', {
                isReferer: false,
              });
              controller.model.members = [notReferer, notReferer2];

              // when then
              assert.false(controller.shouldDisplayUpdateRefererButton);
            });
          });
        });
      });

      module('when current user does not have the role "ADMIN"', function (hooks) {
        hooks.beforeEach(function () {
          sinon.stub(currentUser, 'isAdminOfCurrentCertificationCenter').value(false);
        });

        module('when there is only one member', function () {
          test('returns false', function (assert) {
            // given
            const isReferer = store.createRecord('member', {
              isReferer: true,
            });
            controller.model.members = [isReferer];

            // when then
            assert.false(controller.shouldDisplayUpdateRefererButton);
          });
        });

        module('when there is at least 2 members', function () {
          module('with a referer', function () {
            test('returns false', function (assert) {
              // given
              const notReferer = store.createRecord('member', {
                isReferer: false,
              });
              const isReferer = store.createRecord('member', {
                isReferer: true,
              });
              controller.model.members = [notReferer, isReferer];

              // when then
              assert.false(controller.shouldDisplayUpdateRefererButton);
            });
          });

          module('without referer', function () {
            test('returns false', function (assert) {
              // given
              const notReferer = store.createRecord('member', {
                isReferer: false,
              });
              const notReferer2 = store.createRecord('member', {
                isReferer: false,
              });
              controller.model.members = [notReferer, notReferer2];

              // when then
              assert.false(controller.shouldDisplayUpdateRefererButton);
            });
          });
        });
      });
    });

    module('when certification center does not have CLEA habilitation', function (hooks) {
      hooks.beforeEach(function () {
        controller.model = { hasCleaHabilitation: false };
      });

      module('when current user has the role "ADMIN"', function (hooks) {
        hooks.beforeEach(function () {
          sinon.stub(currentUser, 'isAdminOfCurrentCertificationCenter').value(true);
        });

        module('when there is only one member', function () {
          test('returns false', function (assert) {
            // given
            const isReferer = store.createRecord('member', {
              isReferer: true,
            });
            controller.model.members = [isReferer];

            // when then
            assert.false(controller.shouldDisplayUpdateRefererButton);
          });
        });

        module('when there is at least 2 members', function () {
          module('with a referer', function () {
            test('returns false', function (assert) {
              // given
              const notReferer = store.createRecord('member', {
                isReferer: false,
              });
              const isReferer = store.createRecord('member', {
                isReferer: true,
              });
              controller.model.members = [notReferer, isReferer];

              // when then
              assert.false(controller.shouldDisplayUpdateRefererButton);
            });
          });

          module('without referer', function () {
            test('returns false', function (assert) {
              // given
              const notReferer = store.createRecord('member', {
                isReferer: false,
              });
              const notReferer2 = store.createRecord('member', {
                isReferer: false,
              });
              controller.model.members = [notReferer, notReferer2];

              // when then
              assert.false(controller.shouldDisplayUpdateRefererButton);
            });
          });
        });
      });

      module('when current user does not have the role "ADMIN"', function (hooks) {
        hooks.beforeEach(function () {
          sinon.stub(currentUser, 'isAdminOfCurrentCertificationCenter').value(false);
        });

        module('when there is only one member', function () {
          test('returns false', function (assert) {
            // given
            const isReferer = store.createRecord('member', {
              isReferer: true,
            });
            controller.model.members = [isReferer];

            // when then
            assert.false(controller.shouldDisplayUpdateRefererButton);
          });
        });

        module('when there is at least 2 members', function () {
          module('with a referer', function () {
            test('returns false', function (assert) {
              // given
              const notReferer = store.createRecord('member', {
                isReferer: false,
              });
              const isReferer = store.createRecord('member', {
                isReferer: true,
              });
              controller.model.members = [notReferer, isReferer];

              // when then
              assert.false(controller.shouldDisplayUpdateRefererButton);
            });
          });

          module('without referer', function () {
            test('returns false', function (assert) {
              // given
              const notReferer = store.createRecord('member', {
                isReferer: false,
              });
              const notReferer2 = store.createRecord('member', {
                isReferer: false,
              });
              controller.model.members = [notReferer, notReferer2];

              // when then
              assert.false(controller.shouldDisplayUpdateRefererButton);
            });
          });
        });
      });
    });
  });
});
