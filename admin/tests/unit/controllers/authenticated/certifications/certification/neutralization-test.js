import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/certifications/certification/neutralization', function (hooks) {
  setupTest(hooks);

  module('#neutralizeChallenge', function () {
    test('neutralizes a challenge', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/neutralization');
      controller.certificationDetails = {
        id: 'certificationCourseId',
        save: sinon.stub(),
        listChallengesAndAnswers: [{ challengeId: 'challengeRecId123', isNeutralized: false }],
      };
      controller.certificationDetails.save.resolves({});

      // when
      await controller.neutralize('challengeRecId123', 2);

      // then
      assert.ok(
        controller.certificationDetails.save.calledOnceWithExactly({
          adapterOptions: {
            isNeutralizeChallenge: true,
            certificationCourseId: 'certificationCourseId',
            challengeRecId: 'challengeRecId123',
          },
        }),
      );
    });

    test('notifies a successful neutralization and updates model', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/neutralization');
      controller.certificationDetails = {
        id: 'certificationCourseId',
        save: sinon.stub(),
        listChallengesAndAnswers: [{ challengeId: 'challengeRecId123', isNeutralized: false }],
      };
      controller.certificationDetails.save
        .withArgs({
          adapterOptions: {
            isNeutralizeChallenge: true,
            certificationCourseId: 'certificationCourseId',
            challengeRecId: 'challengeRecId123',
          },
        })
        .resolves({});
      const notifications = {
        success: sinon.stub(),
      };
      controller.notifications = notifications;

      // when
      await controller.neutralize('challengeRecId123', 2);

      // then
      assert.ok(
        controller.notifications.success.calledOnceWithExactly('La question n°2 a été neutralisée avec succès.'),
      );
      assert.true(controller.certificationDetails.listChallengesAndAnswers[0].isNeutralized);
    });

    test('notifies a failed neutralization', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/neutralization');
      controller.certificationDetails = {
        id: 'certificationCourseId',
        save: sinon.stub(),
        listChallengesAndAnswers: [{ challengeId: 'challengeRecId123', isNeutralized: false }],
      };
      controller.certificationDetails.save
        .withArgs({
          adapterOptions: {
            isNeutralizeChallenge: true,
            certificationCourseId: 'certificationCourseId',
            challengeRecId: 'challengeRecId123',
          },
        })
        .rejects({});
      const notifications = {
        error: sinon.stub(),
      };
      controller.notifications = notifications;

      // when
      await controller.neutralize('challengeRecId123', 2);

      // then
      assert.ok(
        controller.notifications.error.calledOnceWithExactly(
          'Une erreur est survenue lors de la neutralisation de la question n°2.',
        ),
      );
    });
  });

  module('#deneutralizeChallenge', function () {
    test('deneutralizes a challenge', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/neutralization');
      controller.certificationDetails = {
        id: 'certificationCourseId',
        save: sinon.stub(),
        listChallengesAndAnswers: [{ challengeId: 'challengeRecId123', isNeutralized: false }],
      };
      controller.certificationDetails.save.resolves({});

      // when
      await controller.deneutralize('challengeRecId123', 2);

      // then
      assert.ok(
        controller.certificationDetails.save.calledOnceWithExactly({
          adapterOptions: {
            isDeneutralizeChallenge: true,
            certificationCourseId: 'certificationCourseId',
            challengeRecId: 'challengeRecId123',
          },
        }),
      );
    });

    test('notifies a successful deneutralization and updates model', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/neutralization');
      controller.certificationDetails = {
        id: 'certificationCourseId',
        save: sinon.stub(),
        listChallengesAndAnswers: [{ challengeId: 'challengeRecId123', isNeutralized: false }],
      };
      controller.certificationDetails.save.resolves({});
      const notifications = {
        success: sinon.stub(),
      };
      controller.notifications = notifications;

      // when
      await controller.deneutralize('challengeRecId123', 2);

      // then
      assert.ok(
        controller.notifications.success.calledOnceWithExactly('La question n°2 a été dé-neutralisée avec succès.'),
      );
      assert.false(controller.certificationDetails.listChallengesAndAnswers[0].isNeutralized);
    });

    test('notifies a failed deneutralization', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/certification/neutralization');
      controller.certificationDetails = {
        id: 'certificationCourseId',
        save: sinon.stub(),
        listChallengesAndAnswers: [{ challengeId: 'challengeRecId123', isNeutralized: false }],
      };
      controller.certificationDetails.save.rejects({});
      const notifications = {
        error: sinon.stub(),
      };
      controller.notifications = notifications;

      // when
      await controller.deneutralize('challengeRecId123', 2);

      // then
      assert.ok(
        controller.notifications.error.calledOnceWithExactly(
          'Une erreur est survenue lors de la dé-neutralisation de la question n°2.',
        ),
      );
    });
  });
});
