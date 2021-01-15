import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import EmberObject from '@ember/object';

module('Unit | Route | authenticated/sessions/add-student', function(hooks) {
  setupTest(hooks);
  let route;

  module('#model', function(hooks) {
    const session_id = 1;
    const session = { id: session_id };
    const certificationCenterId = Symbol('certificationCenterId');

    const paginatedStudents = {
      data: [{ id: '1', firstName: 'Tom', lastName: 'Dupont', isEnrolled: true }],
      meta: {
        page: 1,
        pageCount: 1,
        pageSize: 10,
        rowCount: 5,
      },
    };

    hooks.beforeEach(function() {
      route = this.owner.lookup('route:authenticated/sessions/add-student');
    });

    test('it should return the session', async function(assert) {
      // given
      const divisions = [EmberObject.create({ name: '3A' }), EmberObject.create({ name: '3B' })];
      const findRecordStub = sinon.stub();
      findRecordStub.withArgs('session', session_id).resolves(session);
      route.store.findRecord = findRecordStub;
      route.store.query = sinon.stub();
      route.store.query.onCall(0).resolves([Symbol('a candidate')]);
      route.store.query.onCall(1).resolves(divisions);
      route.store.query.onCall(2).resolves(paginatedStudents);
      route.currentUser = {
        currentCertificationCenter: { id: certificationCenterId },
      };

      const expectedModel = {
        certificationCenterDivisions: [
          {
            label: '3A',
            value: '3A',
          },
          {
            label: '3B',
            value: '3B',
          },
        ],
        numberOfEnrolledStudents: 1,
        session,
        students: paginatedStudents,
        selectedDivisions: undefined,
      };

      // when
      const actualModel = await route.model({ session_id, pageNumber: 1, pageSize: 1 });

      // then
      sinon.assert.calledWith(route.store.query, 'student', {
        filter: {
          certificationCenterId,
          sessionId: session.id,
          divisions: undefined,
        },
        page: {
          size: 1,
          number: 1,
        },
      });
      assert.deepEqual(actualModel, expectedModel);
    });
  });
});
