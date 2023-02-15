import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import setupIntl from '../../../helpers/setup-intl';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Trainings | Triggers edit', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let trainingId;

  hooks.beforeEach(async function () {
    _createLearningContent(server);
    trainingId = 2;

    server.create('training', {
      id: 2,
      title: 'Devenir tailleur de citrouille',
      link: 'http://www.example2.net',
      type: 'autoformation',
      duration: '10:00:00',
      locale: 'fr-fr',
      editorName: "Ministère de l'éducation nationale et de la jeunesse",
      editorLogoUrl: 'https://mon-logo.svg',
      prerequisiteThreshold: null,
      goalThreshold: null,
    });
  });

  module('When admin member is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit(`/trainings/1/triggers/edit`);

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When admin member is logged in', function () {
    test('it should be accessible by an authenticated user : prerequisite edit', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/trainings/${trainingId}/`);
      await click(
        screen.getByRole('link', {
          name: this.intl.t('pages.trainings.training.triggers.prerequisite.alternative-title'),
        })
      );

      // then
      assert.strictEqual(currentURL(), `/trainings/${trainingId}/triggers/edit?type=prerequisite`);
    });

    test('it should be accessible by an authenticated user : goal edit', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/trainings/${trainingId}/`);
      await click(
        screen.getByRole('link', { name: this.intl.t('pages.trainings.training.triggers.goal.alternative-title') })
      );

      // then
      assert.strictEqual(currentURL(), `/trainings/${trainingId}/triggers/edit?type=goal`);
    });

    test('it should be able to cancel the edit form', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/trainings/${trainingId}/triggers/edit?type=prerequisite`);
      await click(screen.getByRole('button', { name: 'Annuler' }));

      // then
      assert.strictEqual(currentURL(), `/trainings/${trainingId}/triggers`);
    });
  });
});

function _createLearningContent(server) {
  const framework_f1 = _createFramework(server, 'Pix');
  const area_f1_a1 = _createArea('area_f1_a1', framework_f1, server);
  const area_f1_a2 = _createArea('area_f1_a2', framework_f1, server);
  const competence_f1_a1_c1 = _createCompetence('competence_f1_a1_c1', area_f1_a1, server);
  const competence_f1_a1_c2 = _createCompetence('competence_f1_a1_c2', area_f1_a1, server);
  const competence_f1_a2_c1 = _createCompetence('competence_f1_a2_c1', area_f1_a2, server);
  const thematic_f1_a1_c1_th1 = _createThematic('thematic_f1_a1_c1_th1', competence_f1_a1_c1, server);
  const thematic_f1_a1_c1_th2 = _createThematic('thematic_f1_a1_c1_th2', competence_f1_a1_c1, server);
  const thematic_f1_a1_c2_th1 = _createThematic('thematic_f1_a1_c2_th1', competence_f1_a1_c2, server);
  const thematic_f1_a2_c1_th1 = _createThematic('thematic_f1_a2_c1_th1', competence_f1_a2_c1, server);
  _createTube('tube_f1_a1_c1_th1_tu1', true, false, thematic_f1_a1_c1_th1, server);
  _createTube('tube_f1_a1_c1_th1_tu2', false, true, thematic_f1_a1_c1_th1, server);
  _createTube('tube_f1_a1_c1_th2_tu1', true, true, thematic_f1_a1_c1_th2, server);
  _createTube('tube_f1_a1_c2_th1_tu1', true, true, thematic_f1_a1_c2_th1, server);
  _createTube('tube_f1_a2_c1_th1_tu1', true, true, thematic_f1_a2_c1_th1, server);
  const framework_f2 = _createFramework(server, 'Pix + Cuisine');
  const area_f2_a1 = _createArea('area_f2_a1', framework_f2, server);
  const competence_f2_a1_c1 = _createCompetence('competence_f2_a1_c1', area_f2_a1, server);
  const thematic_f2_a1_c1_th1 = _createThematic('thematic_f2_a1_c1_th1', competence_f2_a1_c1, server);
  _createTube('tube_f2_a1_c1_th1_tu1', false, false, thematic_f2_a1_c1_th1, server);
}

function _createFramework(server, name) {
  return server.create('framework', { name, areas: [] });
}

function _createArea(variableName, framework, server) {
  const area = server.create('area', {
    code: `${variableName} code`,
    title: `${variableName} title`,
    color: `${variableName} color`,
    frameworkId: framework.id,
    competences: [],
  });
  framework.update({ areas: [...framework.areas.models, area] });
  return area;
}

function _createCompetence(variableName, area, server) {
  const competence = server.create('competence', {
    name: `${variableName} name`,
    index: `${variableName} index`,
    areaId: area.id,
    thematics: [],
  });
  area.update({ competences: [...area.competences.models, competence] });
  return competence;
}

function _createThematic(variableName, competence, server) {
  const thematic = server.create('thematic', {
    name: `${variableName} name`,
    index: `${variableName} index`,
    tubes: [],
  });
  competence.update({ thematics: [...competence.thematics.models, thematic] });
  return thematic;
}

function _createTube(variableName, mobile, tablet, thematic, server) {
  const tube = server.create('tube', {
    id: variableName,
    name: `${variableName} name`,
    practicalTitle: `${variableName} practicalTitle`,
    practicalDescription: `${variableName} practicalDescription`,
    mobile,
    tablet,
    skills: [],
    competenceId: null,
  });
  thematic.update({ tubes: [...thematic.tubes.models, tube] });
  return tube;
}
