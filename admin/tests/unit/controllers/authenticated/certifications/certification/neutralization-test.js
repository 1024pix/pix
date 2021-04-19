import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/certifications/certification/neutralization', function(hooks) {
  setupTest(hooks);
  module('#neutralizeChallenge', async function() {
    test('neutralizes a challenge', async function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/neutralization');
      controller.certificationDetails = {
        id: 'certificationCourseId',
        neutralizeChallenge: sinon.stub(),
      };
      controller.certificationDetails.neutralizeChallenge.resolves({});

      // when
      await controller.neutralize('challengeRecId123');

      // then
      assert.ok(controller.certificationDetails.neutralizeChallenge.calledOnceWithExactly({
        certificationCourseId: 'certificationCourseId',
        challengeRecId: 'challengeRecId123',
      }));
    });

    test('notifies a successful neutralization', async function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/neutralization');
      controller.certificationDetails = {
        id: 'certificationCourseId',
        neutralizeChallenge: sinon.stub(),
      };
      controller.certificationDetails.neutralizeChallenge.resolves({});
      const notifications = {
        success: sinon.stub(),
      };
      controller.notifications = notifications;

      // when
      await controller.neutralize('challengeRecId123');

      // then
      assert.ok(controller.notifications.success.calledOnceWithExactly(
        'Épreuve neutralisée avec succès.',
      ));
    });

    test('notifies a failed neutralization', async function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/neutralization');
      controller.certificationDetails = {
        id: 'certificationCourseId',
        neutralizeChallenge: sinon.stub(),
      };
      controller.certificationDetails.neutralizeChallenge.rejects({});
      const notifications = {
        error: sinon.stub(),
      };
      controller.notifications = notifications;

      // when
      await controller.neutralize('challengeRecId123');

      // then
      assert.ok(controller.notifications.error.calledOnceWithExactly(
        'Une erreur est survenue lors de la neutralisation de l\'épreuve.',
      ));
    });
  });
});
