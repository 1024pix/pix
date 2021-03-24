import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Unit | Adapter | certification issue report', (hooks) => {
  setupTest(hooks);

  test('it exists', async function(assert) {
    // given
    const modelName = 'certification-issue-report';
    const certificationCourseId = 1;
    const certificationReport = EmberObject.create({ certificationCourseId, attr: sinon.stub() });
    const snapshot = {
      belongsTo: sinon.stub(),
      description: 'Un problème',
      category: 'une catégorie',
    };
    snapshot.belongsTo.withArgs('certificationReport').returns(certificationReport);
    certificationReport.attr.withArgs('certificationCourseId').returns(certificationCourseId);

    // when
    const adapter = this.owner.lookup('adapter:certification-issue-report');
    const url = await adapter.urlForCreateRecord(modelName, snapshot);

    // then
    assert.ok(url.endsWith('/api/certification-reports/1/certification-issue-reports'));
  });
});
