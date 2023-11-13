import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';
import { getSettledState, settled } from '@ember/test-helpers';

import EmberObject from '@ember/object';
import setupIntl from '../../../../../helpers/setup-intl';

module('Unit | Controller | authenticated/certifications/certification/informations', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  const createCompetence = (code, score, level) => {
    return {
      competence_code: code,
      score: score,
      level: level,
    };
  };

  const createMark = ({ competence_code, score, level, competenceId }) => {
    return {
      competence_code,
      level,
      score,
      area_code: competence_code.substr(0, 1),
      competenceId: competenceId,
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

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:authenticated/certifications/certification/informations');
    controller.model = {
      certification: store.createRecord('certification', {
        competencesWithMark,
      }),
    };
  });

  module('#hasImpactfulIssueReports', () => {
    test('it should return true when there are some issue reports with required action', async function (assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isImpactful: true }),
        EmberObject.create({ isImpactful: false }),
        EmberObject.create({ isImpactful: false }),
        EmberObject.create({ isImpactful: false }),
      ];
      controller.model = {
        certification: EmberObject.create({
          certificationIssueReports,
        }),
        countries: [],
      };

      // when/then
      assert.true(controller.hasImpactfulIssueReports);
    });

    test('it should return false when there are no issue reports with required action', async function (assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isImpactful: false }),
        EmberObject.create({ isImpactful: false }),
        EmberObject.create({ isImpactful: false }),
        EmberObject.create({ isImpactful: false }),
      ];
      controller.model = {
        certification: EmberObject.create({
          certificationIssueReports,
        }),
      };

      // when/then
      assert.false(controller.hasImpactfulIssueReports);
    });
  });

  module('#hasUnimpactfulIssueReports', () => {
    test('it should return true when there are some issue reports without required action', async function (assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isImpactful: false }),
        EmberObject.create({ isImpactful: true }),
        EmberObject.create({ isImpactful: true }),
        EmberObject.create({ isImpactful: true }),
      ];
      controller.model = {
        certification: EmberObject.create({
          certificationIssueReports,
        }),
      };

      // when/then
      assert.true(controller.hasUnimpactfulIssueReports);
    });

    test('it should return false when there are no issue reports without required action', async function (assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isImpactful: true }),
        EmberObject.create({ isImpactful: true }),
        EmberObject.create({ isImpactful: true }),
        EmberObject.create({ isImpactful: true }),
      ];
      controller.model = {
        certification: EmberObject.create({
          certificationIssueReports,
        }),
      };

      // when/then
      assert.false(controller.hasUnimpactfulIssueReports);
    });
  });

  module('#hasIssueReports', () => {
    test('it should return true when there are some issue reports', async function (assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isImpactful: true }),
        EmberObject.create({ isImpactful: false }),
        EmberObject.create({ isImpactful: true }),
        EmberObject.create({ isImpactful: false }),
      ];
      controller.model = {
        certification: EmberObject.create({
          certificationIssueReports,
        }),
      };

      // when/then
      assert.true(controller.hasIssueReports);
    });

    test('it should return false when there are no issue reports', async function (assert) {
      // given
      const certificationIssueReports = [];
      controller.model = {
        certification: EmberObject.create({
          certificationIssueReports,
        }),
      };

      // when/then
      assert.false(controller.hasIssueReports);
    });
  });

  module('#shouldDisplayJuryLevelEditButton', function () {
    module('when isExternalResultEditable is true', function () {
      test('it should return true', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const complementaryCertificationCourseResultWithExternal = store.createRecord(
          'complementary-certification-course-result-with-external',
        );

        sinon.stub(complementaryCertificationCourseResultWithExternal, 'isExternalResultEditable').get(() => true);

        const certification = store.createRecord('certification', {
          complementaryCertificationCourseResultWithExternal,
        });

        controller.model = {
          certification,
        };
        // when
        const shouldDisplayJuryLevelEditButton = controller.shouldDisplayJuryLevelEditButton;

        // then
        assert.ok(shouldDisplayJuryLevelEditButton);
      });
    });

    module('when isExternalResultEditable is false', function () {
      test('it should return false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const complementaryCertificationCourseResultWithExternal = store.createRecord(
          'complementary-certification-course-result-with-external',
        );

        sinon.stub(complementaryCertificationCourseResultWithExternal, 'isExternalResultEditable').get(() => false);

        const certification = store.createRecord('certification', {
          complementaryCertificationCourseResultWithExternal,
        });

        controller.model = {
          certification,
        };

        // when
        const shouldDisplayJuryLevelEditButton = controller.shouldDisplayJuryLevelEditButton;

        // then
        assert.false(shouldDisplayJuryLevelEditButton);
      });
    });
  });

  module('#isCertificationCancelled', function () {
    test('should return true when certification status is cancelled', function (assert) {
      // given
      controller.model = {
        certification: EmberObject.create({
          status: 'cancelled',
        }),
      };

      // when/then
      assert.true(controller.isCertificationCancelled);
    });
  });

  module('#juryLevelOptions', function () {
    test('should return an array of labels and values', function (assert) {
      // given
      const complementaryCertificationCourseResultWithExternal = EmberObject.create({
        allowedExternalLevels: [
          {
            value: 'COMME',
            label: 'je veux',
          },
        ],
        defaultJuryOptions: ['REJECTED', 'UNSET'],
      });
      controller.model = {
        certification: EmberObject.create({
          status: 'cancelled',
          complementaryCertificationCourseResultWithExternal,
        }),
      };

      // when
      const juryLevelOptions = controller.juryLevelOptions;

      //then
      assert.deepEqual(juryLevelOptions, [
        {
          value: 'COMME',
          label: 'je veux',
        },
        { value: 'REJECTED', label: 'Rejetée' },
        { value: 'UNSET', label: 'En attente' },
      ]);
    });
  });

  module('#impactfulCertificationIssueReports', () => {
    test('it should return certification issue reports with action required', async function (assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isImpactful: true }),
        EmberObject.create({ isImpactful: false }),
        EmberObject.create({ isImpactful: true }),
        EmberObject.create({ isImpactful: false }),
      ];
      controller.model = {
        certification: EmberObject.create({
          certificationIssueReports,
        }),
      };

      // when/then
      assert.strictEqual(controller.impactfulCertificationIssueReports.length, 2);
    });
  });

  module('#unimpactfulCertificationIssueReports', () => {
    test('it should return certification issue reports without action required', async function (assert) {
      // given
      const certificationIssueReports = [
        EmberObject.create({ isImpactful: true }),
        EmberObject.create({ isImpactful: false }),
        EmberObject.create({ isImpactful: true }),
        EmberObject.create({ isImpactful: false }),
        EmberObject.create({ isImpactful: false }),
      ];
      controller.model = {
        certification: EmberObject.create({
          certificationIssueReports,
        }),
      };

      // when/then
      assert.strictEqual(controller.unimpactfulCertificationIssueReports.length, 3);
    });
  });

  module('#onUpdateScore', () => {
    module('when there is a given score', function () {
      test('it replaces competence score correctly', async function (assert) {
        // When
        await controller.onUpdateScore(anExistingCompetenceCode, '55');

        // then
        const competences = controller.certification.competencesWithMark;
        const aCompetence = _getCompetenceWithMark(anExistingCompetenceCode, competences);

        assert.strictEqual(aCompetence.score, 55);
      });
    });

    module('when there is no given score and competence has no level', function () {
      test('it removes competence correctly (score)', async function (assert) {
        // When
        await controller.onUpdateScore(anExistingCompetenceWithNoLevelCode, '');

        // then
        const competences = controller.certification.competencesWithMark;
        const aCompetence = _getCompetenceWithMark(anExistingCompetenceWithNoLevelCode, competences);

        assert.notOk(aCompetence);
      });
    });

    module('when the competence is not present', function () {
      test('it creates competence score correctly', async function (assert) {
        // When
        await controller.onUpdateScore(aNewCompetenceCode, '55');

        // then
        const competences = controller.certification.competencesWithMark;
        const aCompetence = _getCompetenceWithMark(aNewCompetenceCode, competences);

        assert.strictEqual(aCompetence.score, 55);
      });
    });
  });

  module('#onUpdateLevel', () => {
    module('when there is a given level', function () {
      test('it replaces competence level correctly', async function (assert) {
        // When
        await controller.onUpdateLevel(anExistingCompetenceCode, '5');

        // then
        const competences = controller.certification.competencesWithMark;
        const aCompetence = _getCompetenceWithMark(anExistingCompetenceCode, competences);

        assert.strictEqual(aCompetence.level, 5);
      });
    });

    module('when there is no given level and competence has no score', function () {
      test('it removes competence correctly (level)', async function (assert) {
        // When
        await controller.onUpdateLevel(anExistingCompetenceWithNoScoreCode, '');

        // then
        const competences = controller.certification.competencesWithMark;
        const aCompetence = _getCompetenceWithMark(anExistingCompetenceWithNoScoreCode, competences);

        assert.notOk(aCompetence);
      });
    });

    module('when the competence is not present', function () {
      test('it creates competence level correctly', async function (assert) {
        // When
        await controller.onUpdateLevel(aNewCompetenceCode, '8');

        // then
        const competences = controller.certification.competencesWithMark;
        const aCompetence = _getCompetenceWithMark(aNewCompetenceCode, competences);

        assert.strictEqual(aCompetence.level, 8);
      });
    });
  });

  module('#onCandidateResultsSave', () => {
    test('it saves competences info when save is sent', async function (assert) {
      // given
      const save = sinon.stub().resolves();
      const store = this.owner.lookup('service:store');

      const certification = store.createRecord('certification', {
        competencesWithMark,
      });
      certification.save = save;
      controller.certification = certification;

      // when
      await controller.onCandidateResultsSave();

      // then
      sinon.assert.calledWith(save, { adapterOptions: { updateMarks: true } });
      assert.ok(true);
    });
  });

  module('#onCandidateResultsSaveConfirm', () => {
    module('when there are no error', () => {
      test('should get no error and enable confirm dialog', async function (assert) {
        // when
        await controller.onCandidateResultsSaveConfirm();

        // then
        assert.strictEqual(controller.confirmAction, 'onCandidateResultsSave');
        assert.ok(controller.displayConfirm);
        assert.ok(controller.confirmMessage);
        assert.notOk(controller.confirmErrorMessage);
      });
    });

    module('when there are errors', () => {
      test('should get errors and enable confirm dialog', async function (assert) {
        // given
        controller.certification.competencesWithMark.addObject({
          competence_code: anExistingCompetenceCode,
          level: controller.MAX_REACHABLE_LEVEL + 1,
          score: controller.MAX_REACHABLE_PIX_BY_COMPETENCE,
        });
        controller.certification.competencesWithMark.addObject({
          competence_code: anotherExistingCompetenceCode,
          level: controller.MAX_REACHABLE_LEVEL,
          score: controller.MAX_REACHABLE_PIX_BY_COMPETENCE + 1,
        });

        // when
        await controller.onCandidateResultsSaveConfirm();

        // then
        const levelErrorRegexp = `.*niveau.*${anExistingCompetenceCode}.*${controller.MAX_REACHABLE_LEVEL}`;
        const scoreErrorRegexp = `.*nombre de pix.*${anotherExistingCompetenceCode}.*${controller.MAX_REACHABLE_PIX_BY_COMPETENCE}`;

        assert.strictEqual(controller.confirmAction, 'onCandidateResultsSave');
        assert.ok(controller.displayConfirm);
        assert.ok(controller.confirmMessage);
        assert.ok(controller.confirmErrorMessage.match(new RegExp(levelErrorRegexp)));
        assert.ok(controller.confirmErrorMessage.match(new RegExp(scoreErrorRegexp)));
      });
    });
  });

  module('#onCheckMarks', () => {
    module('when there is no mark', () => {
      test('should not set competencesWithMark', async function (assert) {
        // when
        await controller.onCheckMarks();
        // then
        assert.deepEqual(controller.certification.competencesWithMark, competencesWithMark);
      });
    });

    module('when there are marks', () => {
      test('should set competencesWithMark', async function (assert) {
        // given
        const score = 100;
        const anExistingCompetence = _getCompetenceWithMark(anExistingCompetenceCode);

        const expectedCompetencesWithMark = [
          createMark({
            competence_code: anExistingCompetenceCode,
            level: anExistingCompetence.level + 1,
            score: anExistingCompetence.score + 1,
            competenceId: 'recComp1',
          }),
          createMark({
            competence_code: aNewCompetenceCode,
            level: 5,
            score: 6,
            competenceId: 'recComp2',
          }),
        ];

        const store = this.owner.lookup('service:mark-store');
        store.storeState({
          score,
          marks: {
            [anExistingCompetenceCode]: {
              level: anExistingCompetence.level + 1,
              score: anExistingCompetence.score + 1,
              competenceId: 'recComp1',
            },
            [aNewCompetenceCode]: {
              level: 5,
              score: 6,
              competenceId: 'recComp2',
            },
          },
        });

        // when
        await controller.onCheckMarks();
        const state = await getSettledState();

        // then
        assert.strictEqual(controller.certification.pixScore, score);
        assert.deepEqual(controller.certification.competencesWithMark, expectedCompetencesWithMark);
        assert.ok(state.hasPendingTimers);

        await settled();
        assert.ok(controller.editingCandidateResults);
      });
    });
  });

  module('#onCandidateInformationSave', () => {
    test('it closes the modal', async function (assert) {
      // given
      controller.saveCertificationCourse = sinon.stub().resolves();
      controller.isCandidateEditModalOpen = true;

      // when
      await controller.onCandidateInformationSave();

      // then
      assert.false(controller.isCandidateEditModalOpen);
    });

    test('it saves candidates infos', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', { competencesWithMark });
      certification.save = sinon.stub().resolves();
      controller.certification = certification;

      // when
      await controller.onCandidateInformationSave();

      // then
      sinon.assert.calledWith(certification.save, { adapterOptions: { updateMarks: false } });
      assert.ok(true);
    });
  });

  module('#editJury', function () {
    test('it should set displayJuryLevelSelect to true', function (assert) {
      // given
      controller.displayJuryLevelSelect = false;

      // when
      controller.editJury();

      // then
      assert.true(controller.displayJuryLevelSelect);
    });
  });

  module('#onCancelJuryLevelEditButtonClick', function () {
    test('it should set displayJuryLevelSelect to false', function (assert) {
      // given
      controller.displayJuryLevelSelect = true;

      // when
      controller.onCancelJuryLevelEditButtonClick();

      // then
      assert.false(controller.displayJuryLevelSelect);
    });
  });

  module('#selectJuryLevel', function () {
    test('it should set selectedJuryLevel', function (assert) {
      // given
      controller.selectedJuryLevel = '';

      // when
      controller.selectJuryLevel('REJECTED');

      // then
      assert.strictEqual(controller.selectedJuryLevel, 'REJECTED');
    });
  });

  module('#onEditJuryLevelSave', function () {
    module('when the jury level is not empty', function () {
      test('it should save it', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        controller.selectedJuryLevel = 'REJECTED';
        const complementaryCertificationCourseResultWithExternal = store.createRecord(
          'complementary-certification-course-result-with-external',
          {
            complementaryCertificationCourseId: 12345,
          },
        );

        controller.certification.editJuryLevel = sinon.stub().resolves();
        controller.certification.reload = sinon.stub().resolves();
        controller.certification.complementaryCertificationCourseResultWithExternal =
          complementaryCertificationCourseResultWithExternal;

        controller.displayJuryLevelSelect = true;

        // when
        await controller.onEditJuryLevelSave();

        // then
        assert.false(controller.displayJuryLevelSelect);
        sinon.assert.calledOnceWithExactly(controller.certification.editJuryLevel, {
          juryLevel: 'REJECTED',
          complementaryCertificationCourseId: 12345,
        });
        assert.ok(controller.certification.reload.calledOnce);
      });
    });

    module('when the jury level is empty', function () {
      test('it should not save it', async function (assert) {
        // given
        controller.selectedJuryLevel = null;
        controller.certification.editJuryLevel = sinon.stub().resolves();
        controller.certification.reload = sinon.stub().resolves();
        controller.displayJuryLevelSelect = true;

        // when
        await controller.onEditJuryLevelSave();

        // then
        assert.true(controller.displayJuryLevelSelect);
        assert.notOk(controller.certification.editJuryLevel.calledOnce);
        assert.notOk(controller.certification.reload.calledOnce);
      });
    });
  });

  test('it restores competences when cancel is sent', async function (assert) {
    // given
    const rollbackAttributes = sinon.stub().resolves();
    controller.certification.rollbackAttributes = rollbackAttributes;

    await controller.onCandidateResultsEdit();
    await controller.onUpdateLevel(anExistingCompetenceCode, '5');
    await controller.onUpdateScore(anExistingCompetenceCode, '50');
    await controller.onUpdateLevel(anotherExistingCompetenceCode, '');
    await controller.onUpdateScore(anotherExistingCompetenceCode, '');

    // when
    await controller.onCandidateResultsCancel();

    // then
    const competences = controller.certification.competencesWithMark;

    let aCompetence = _getCompetenceWithMark(anotherExistingCompetenceCode);
    let aCompetenceRef = _getCompetenceWithMark(anotherExistingCompetenceCode);

    assert.strictEqual(aCompetence.score, aCompetenceRef.score);
    assert.strictEqual(aCompetence.level, aCompetenceRef.level);

    aCompetence = _getCompetenceWithMark(anExistingCompetenceCode, competences);
    aCompetenceRef = _getCompetenceWithMark(anExistingCompetenceCode);
    assert.strictEqual(aCompetence.score, aCompetenceRef.score);
    assert.strictEqual(aCompetence.level, aCompetenceRef.level);

    sinon.assert.calledOnce(rollbackAttributes);
  });

  function _getCompetenceWithMark(code, competences = competencesWithMark) {
    return competences.find((value) => value.competence_code === code);
  }
});
