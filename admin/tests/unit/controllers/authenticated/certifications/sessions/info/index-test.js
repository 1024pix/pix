// import { module, test } from 'qunit';
// import { setupTest } from 'ember-qunit';
// import { beforeEach, describe, it } from 'mocha';

import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

module('Unit | Controller | authenticated/certifications/sessions/info/index', function() {

  // setupTest(hooks);
  //
  // test('it exists', function(assert) {
  //   const controller = this.owner.lookup('controller:authenticated/certifications/sessions/info/index');
  //   assert.ok(controller);
  // });

  setupTest();

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/certifications/sessions/info/index');
  });

  describe('#downloadSessionResultFile', () => {

    it('should launch the download of result file', function() {
      // given
      controller.set('sessionInfoService', '');
      controller.set('notifications', '');
      // controller.set('session', '');
      controller.set('session', EmberObject.create({
        competences:[competence(false,'ok','ok','skip'), competence(false,'ok', 'ko', 'ok'), competence(false,'ok', 'aband', 'ok'), competence(false,'ok', 'timedout', 'ok'), competence(false,'ok', 'ok', 'ok')]
      }));

      // when
      controller.actions.downloadSessionResultFile.call(controller);

      // then
      // sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume', 'konami', {
      //   queryParams: {
      //     hasSeenLanding: true,
      //     participantExternalId: 'a73at01r3'
      //   }
      // });

    });
  });
});
