import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';
import { getSettledState, settled } from '@ember/test-helpers';

import EmberObject from '@ember/object';

module('Unit | Controller | authenticated/certifications/certification/informations', (hooks) => {

  setupTest(hooks);

  const createCompetence = (code, score, level) => {
    return {
      competence_code: code,
      score: score,
      level: level,
    };
  };

  const createMark = ({
    competence_code,
    score,
    level,
  }) => {
    return {
      competence_code,
      level,
      score,
      area_code: competence_code.substr(0, 1),
      'competence-id': undefined,
    };
  };

  const aNewCompetenceCode = '4.2';
  const anExistingCompetenceCode = '1.1';
  const anExistingCompetenceWithNoScoreCode = '1.2';
  const anExistingCompetenceWithNoLevelCode = '1.3';
  const anotherExistingCompetenceCode = '5.2';

  const competencesWithMark = [
    createCompetence(anExistingCompetenceCode, 24, 3),
    createCompetence(anExistingCompetenceWithNoScoreCode, null, 5),
    createCompetence(anExistingCompetenceWithNoLevelCode, 40, null),
    createCompetence(anotherExistingCompetenceCode, 33, 4),
  ];

  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/certifications/certification/informations');
    controller.certification = EmberObject.create({
      competencesWithMark,
    });
  });

  module('#cleaStatusClass', () => {

    test('it should return acquired class', async function(assert) {
      controller.certification = EmberObject.create({ isCleaCertificationIsAcquired: true });
      assert.equal(controller.cleaStatusClass, 'certification-informations__clea--acquired');
    });

    test('it should return rejected class', async function(assert) {
      controller.certification = EmberObject.create({ isCleaCertificationIsRejected: true });
      assert.equal(controller.cleaStatusClass, 'certification-informations__clea--rejected');
    });

    test('it should return empty class', async function(assert) {
      controller.certification = EmberObject.create({
        isCleaCertificationIsAcquired: false,
        isCleaCertificationIsRejected: false,
      });
      assert.equal(controller.cleaStatusClass, '');
    });
  });

  module('#hasIssueReportsWithRequiredAction', () => {
    test('it should return true when there are some issue reports with required action', async function(assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isActionRequired: true }),
        EmberObject.create({ isActionRequired: false }),
        EmberObject.create({ isActionRequired: false }),
        EmberObject.create({ isActionRequired: false }),
      ];
      controller.certification = EmberObject.create({
        certificationIssueReports,
      });

      // when/then
      assert.equal(controller.hasIssueReportsWithRequiredAction, true);
    });

    test('it should return false when there are no issue reports with required action', async function(assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isActionRequired: false }),
        EmberObject.create({ isActionRequired: false }),
        EmberObject.create({ isActionRequired: false }),
        EmberObject.create({ isActionRequired: false }),
      ];
      controller.certification = EmberObject.create({
        certificationIssueReports,
      });

      // when/then
      assert.equal(controller.hasIssueReportsWithRequiredAction, false);
    });
  });

  module('#hasIssueReportsWithoutRequiredAction', () => {
    test('it should return true when there are some issue reports without required action', async function(assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isActionRequired: false }),
        EmberObject.create({ isActionRequired: true }),
        EmberObject.create({ isActionRequired: true }),
        EmberObject.create({ isActionRequired: true }),
      ];
      controller.certification = EmberObject.create({
        certificationIssueReports,
      });

      // when/then
      assert.equal(controller.hasIssueReportsWithoutRequiredAction, true);
    });

    test('it should return false when there are no issue reports without required action', async function(assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isActionRequired: true }),
        EmberObject.create({ isActionRequired: true }),
        EmberObject.create({ isActionRequired: true }),
        EmberObject.create({ isActionRequired: true }),
      ];
      controller.certification = EmberObject.create({
        certificationIssueReports,
      });

      // when/then
      assert.equal(controller.hasIssueReportsWithoutRequiredAction, false);
    });
  });

  module('#hasIssueReports', () => {
    test('it should return true when there are some issue reports', async function(assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isActionRequired: true }),
        EmberObject.create({ isActionRequired: false }),
        EmberObject.create({ isActionRequired: true }),
        EmberObject.create({ isActionRequired: false }),
      ];
      controller.certification = EmberObject.create({
        certificationIssueReports,
      });

      // when/then
      assert.equal(controller.hasIssueReports, true);
    });

    test('it should return false when there are no issue reports', async function(assert) {
      // given
      const certificationIssueReports = [];
      controller.certification = EmberObject.create({
        certificationIssueReports,
      });

      // when/then
      assert.equal(controller.hasIssueReports, false);
    });
  });

  module('#certificationIssueReportsWithRequiredAction', () => {
    test('it should return certification issue reports with action required', async function(assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isActionRequired: true }),
        EmberObject.create({ isActionRequired: false }),
        EmberObject.create({ isActionRequired: true }),
        EmberObject.create({ isActionRequired: false }),
      ];
      controller.certification = EmberObject.create({
        certificationIssueReports,
      });

      // when/then
      assert.equal(controller.certificationIssueReportsWithRequiredAction.length, 2);
    });
  });

  module('#certificationIssueReportsWithoutRequiredAction', () => {
    test('it should return certification issue reports without action required', async function(assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isActionRequired: true }),
        EmberObject.create({ isActionRequired: false }),
        EmberObject.create({ isActionRequired: true }),
        EmberObject.create({ isActionRequired: false }),
        EmberObject.create({ isActionRequired: false }),
      ];
      controller.certification = EmberObject.create({
        certificationIssueReports,
      });

      // when/then
      assert.equal(controller.certificationIssueReportsWithoutRequiredAction.length, 3);
    });
  });

  module('#onUpdateScore', () => {

    module('when there is a given score', () => {

      test('it replaces competence score correctly', async function(assert) {
        // When
        await controller.onUpdateScore(anExistingCompetenceCode, '55');

        // then
        const competences = controller.certification.competencesWithMark;
        const aCompetence = _getCompetenceWithMark(anExistingCompetenceCode, competences);
        assert.equal(aCompetence.score, 55);
      });
    });

    module('when there is no given score and competence has no level', () => {

      test('it removes competence correctly (score)', async function(assert) {
        // When
        await controller.onUpdateScore(anExistingCompetenceWithNoLevelCode, '');

        // then
        const competences = controller.certification.competencesWithMark;
        const aCompetence = _getCompetenceWithMark(anExistingCompetenceWithNoLevelCode, competences);

        assert.notOk(aCompetence);
      });
    });

    module('when the competence is not present', () => {

      test('it creates competence score correctly', async function(assert) {
        // When
        await controller.onUpdateScore(aNewCompetenceCode, '55');

        // then
        const competences = controller.certification.competencesWithMark;
        const aCompetence = _getCompetenceWithMark(aNewCompetenceCode, competences);
        assert.equal(aCompetence.score, 55);
      });
    });
  });

  module('#onUpdateLevel', () => {

    module('when there is a given level', () => {

      test('it replaces competence level correctly', async function(assert) {
        // When
        await controller.onUpdateLevel(anExistingCompetenceCode, '5');

        // then
        const competences = controller.certification.competencesWithMark;
        const aCompetence = _getCompetenceWithMark(anExistingCompetenceCode, competences);
        assert.equal(aCompetence.level, 5);
      });
    });

    module('when there is no given level and competence has no score', () => {

      test('it removes competence correctly (level)', async function(assert) {
        // When
        await controller.onUpdateLevel(anExistingCompetenceWithNoScoreCode, '');

        // then
        const competences = controller.certification.competencesWithMark;
        const aCompetence = _getCompetenceWithMark(anExistingCompetenceWithNoScoreCode, competences);

        assert.notOk(aCompetence);
      });
    });

    module('when the competence is not present', () => {

      test('it creates competence level correctly', async function(assert) {
        // When
        await controller.onUpdateLevel(aNewCompetenceCode, '8');

        // then
        const competences = controller.certification.competencesWithMark;
        const aCompetence = _getCompetenceWithMark(aNewCompetenceCode, competences);
        assert.equal(aCompetence.level, 8);
      });
    });
  });

  module('#onSave', () => {

    test('it saves competences info when save is sent', async function(assert) {
      // given
      const save = sinon.stub().resolves();
      const store = this.owner.lookup('service:store');

      const certification = store.createRecord('certification', {
        competencesWithMark,
      });
      certification.save = save;
      controller.certification = certification;

      // when
      await controller.onSave();

      // then
      sinon.assert.calledWith(save, { adapterOptions: { updateMarks: false } });
      sinon.assert.calledWith(save, { adapterOptions: { updateMarks: true } });
      assert.ok(true);
    });

    test('marks are not updated when no change has been made and save is sent', async function(assert) {
      // given
      const save = sinon.stub().resolves();
      const store = this.owner.lookup('service:store');

      const certification = store.createRecord('certification');
      certification.save = save;
      certification.hasDirtyAttributes = false;
      controller.certification = certification;

      // when
      await controller.onSave();

      // then
      sinon.assert.calledWith(save, { adapterOptions: { updateMarks: false } });
      sinon.assert.neverCalledWith(save, { adapterOptions: { updateMarks: true } });
      assert.ok(true);
    });
  });

  module('#onSaveConfirm', () => {
    module('when there are no error', () => {
      test('should get no error and enable confirm dialog', async (assert) => {
        // when
        await controller.onSaveConfirm();
        // then
        assert.equal(controller.confirmAction, 'onSave');
        assert.ok(controller.displayConfirm);
        assert.ok(controller.confirmMessage);
        assert.notOk(controller.confirmErrorMessage);

      });
    });

    module('when there are errors', () => {
      test('should get errors and enable confirm dialog', async (assert) => {
        // given
        controller.certification.competencesWithMark.addObject(
          {
            competence_code: anExistingCompetenceCode,
            level: controller.MAX_REACHABLE_LEVEL + 1,
            score: controller.MAX_REACHABLE_PIX_BY_COMPETENCE,
          });
        controller.certification.competencesWithMark.addObject(
          {
            competence_code: anotherExistingCompetenceCode,
            level: controller.MAX_REACHABLE_LEVEL,
            score: controller.MAX_REACHABLE_PIX_BY_COMPETENCE + 1,
          },
        );

        // when
        await controller.onSaveConfirm();

        // then
        const levelErrorRegexp = `.*niveau.*${anExistingCompetenceCode}.*${controller.MAX_REACHABLE_LEVEL}`;
        const scoreErrorRegexp = `.*nombre de pix.*${anotherExistingCompetenceCode}.*${controller.MAX_REACHABLE_PIX_BY_COMPETENCE}`;
        assert.equal(controller.confirmAction, 'onSave');
        assert.ok(controller.displayConfirm);
        assert.ok(controller.confirmMessage);
        assert.ok(controller.confirmErrorMessage.match(new RegExp(levelErrorRegexp)));
        assert.ok(controller.confirmErrorMessage.match(new RegExp(scoreErrorRegexp)));
      });
    });
  });

  module('#onCheckMarks', () => {
    module('when there is no mark', () => {
      test('should not set competencesWithMark', async (assert) => {
        // when
        await controller.onCheckMarks();
        // then
        assert.deepEqual(controller.certification.competencesWithMark, competencesWithMark);
      });
    });

    module('when there are marks', () => {
      test('should set competencesWithMark', async function(assert) {
        // given
        const score = 100;
        const anExistingCompetence = _getCompetenceWithMark(anExistingCompetenceCode);

        const expectedCompetencesWithMark = [
          createMark({
            competence_code: anExistingCompetenceCode,
            level: anExistingCompetence.level + 1,
            score: anExistingCompetence.score + 1,
          }),
          createMark({
            competence_code: aNewCompetenceCode,
            level: 5,
            score: 6,
          }),
        ];

        const store = this.owner.lookup('service:mark-store');
        store.storeState({
          score,
          marks: {
            [anExistingCompetenceCode]: {
              level: anExistingCompetence.level + 1,
              score: anExistingCompetence.score + 1,
            },
            [aNewCompetenceCode]: {
              level: 5,
              score: 6,
            },
          },
        });

        // when
        await controller.onCheckMarks();
        const state = await getSettledState();

        // then
        assert.equal(controller.certification.pixScore, score);
        assert.deepEqual(controller.certification.competencesWithMark, expectedCompetencesWithMark);
        assert.ok(state.hasPendingTimers);

        await settled();
        assert.ok(controller.edition);
      });
    });
  });

  test('it restores competences when cancel is sent', async function(assert) {
    // given
    const rollbackAttributes = sinon.stub().resolves();
    controller.certification.rollbackAttributes = rollbackAttributes;

    await controller.onEdit();
    await controller.onUpdateLevel(anExistingCompetenceCode, '5');
    await controller.onUpdateScore(anExistingCompetenceCode, '50');
    await controller.onUpdateLevel(anotherExistingCompetenceCode, '');
    await controller.onUpdateScore(anotherExistingCompetenceCode, '');

    // when
    await controller.onCancel();

    // then
    const competences = controller.certification.competencesWithMark;

    let aCompetence = _getCompetenceWithMark(anotherExistingCompetenceCode);
    let aCompetenceRef = _getCompetenceWithMark(anotherExistingCompetenceCode);
    assert.equal(aCompetence.score, aCompetenceRef.score);
    assert.equal(aCompetence.level, aCompetenceRef.level);

    aCompetence = _getCompetenceWithMark(anExistingCompetenceCode, competences);
    aCompetenceRef = _getCompetenceWithMark(anExistingCompetenceCode);
    assert.equal(aCompetence.score, aCompetenceRef.score);
    assert.equal(aCompetence.level, aCompetenceRef.level);

    sinon.assert.calledOnce(rollbackAttributes);
  });

  function _getCompetenceWithMark(code, competences = competencesWithMark) {
    return competences.find((value) => value.competence_code === code);
  }
});
