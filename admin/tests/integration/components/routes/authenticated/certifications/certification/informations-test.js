import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Integration | Component | routes/authenticated/certifications/certification | informations', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const user = server.create('user');
    await createAuthenticateSession({ userId: user.id });
  });

  module('certification issue report container', function() {

    module('when there is no certification issue report', function() {
      test('it renders nothing', async function(assert) {
        // given
        const certificationIssueReports = [];
        const certification = this.server.create('certification', {
          certificationIssueReports,
          competencesWithMark: [
            {
              'id': 104637,
              'area_code': '5',
              'competence_code': '5.1',
              'competenceId': 'recIhdrmCuEmCDAzj',
              'level': -1,
              'score': 0,
              'assessmentResultId': 104635,
            },
            {
              'id': 104650,
              'area_code': '1',
              'competence_code': '1.3',
              'competenceId': 'recIkYm646lrGvLNT',
              'level': -1,
              'score': 0,
              'assessmentResultId': 104635,
            },
          ],
        });

        // when
        await visit(`/certifications/${certification.id}`);

        // then
        assert.notContains('Signalements');
      });
    });

    module('when there are certification issue reports', function() {

      module('when there are only certification issue reports with required action', function() {

        test('it renders only certifications issue reports with required action', async function(assert) {
          // given
          const certificationIssueReport = this.server.create('certification-issue-report', {
            category: 'OTHER',
            description: 'Un signalement impactant',
            isActionRequired: true,
          });
          const certification = this.server.create('certification', {
            competencesWithMark: [
              {
                'id': 104637,
                'area_code': '5',
                'competence_code': '5.1',
                'competenceId': 'recIhdrmCuEmCDAzj',
                'level': -1,
                'score': 0,
                'assessmentResultId': 104635,
              },
              {
                'id': 104650,
                'area_code': '1',
                'competence_code': '1.3',
                'competenceId': 'recIkYm646lrGvLNT',
                'level': -1,
                'score': 0,
                'assessmentResultId': 104635,
              },
            ],
          });
          certification.update({ certificationIssueReports: [certificationIssueReport] });

          // when
          await visit(`/certifications/${certification.id}`);

          // then
          assert.contains('Signalement(s) impactant(s)');
          assert.dom('.card-text ul li').hasText('Autre (si aucune des catégories ci-dessus ne correspond au signalement) - Un signalement impactant');
          assert.notContains('Signalement(s) non impactant(s)');
        });
      });

      module('when there are only certification issue reports without required action', function() {

        test('it renders only certifications issue reports without required action', async function(assert) {
          // given
          const certificationIssueReport = this.server.create('certification-issue-report', {
            category: 'CANDIDATE_INFORMATIONS_CHANGES',
            subcategory: 'EXTRA_TIME_PERCENTAGE',
            description: 'Un signalement non impactant',
            isActionRequired: false,
          });
          const certification = this.server.create('certification', {
            competencesWithMark: [
              {
                'id': 104637,
                'area_code': '5',
                'competence_code': '5.1',
                'competenceId': 'recIhdrmCuEmCDAzj',
                'level': -1,
                'score': 0,
                'assessmentResultId': 104635,
              },
              {
                'id': 104650,
                'area_code': '1',
                'competence_code': '1.3',
                'competenceId': 'recIkYm646lrGvLNT',
                'level': -1,
                'score': 0,
                'assessmentResultId': 104635,
              },
            ],
          });
          certification.update({ certificationIssueReports: [certificationIssueReport] });

          // when
          await visit(`/certifications/${certification.id}`);

          // then
          assert.contains('Signalement(s) non impactant(s)');
          assert.dom('.card-text ul li').hasText('Modification infos candidat : Ajout/modification du temps majoré - Un signalement non impactant');
          assert.notContains('Signalement(s) impactant(s)');
        });
      });

      test('it renders a "in challenge" issue report with its challenge number', async function(assert) {
        // given
        const certificationIssueReport = this.server.create('certification-issue-report', {
          category: 'IN_CHALLENGE',
          subcategory: 'IMAGE_NOT_DISPLAYING',
          description: 'image disparue',
          questionNumber: 666,
          isActionRequired: true,
        });
        const certification = this.server.create('certification', {
          competencesWithMark: [
            {
              'id': 104637,
              'area_code': '5',
              'competence_code': '5.1',
              'competenceId': 'recIhdrmCuEmCDAzj',
              'level': -1,
              'score': 0,
              'assessmentResultId': 104635,
            },
            {
              'id': 104650,
              'area_code': '1',
              'competence_code': '1.3',
              'competenceId': 'recIkYm646lrGvLNT',
              'level': -1,
              'score': 0,
              'assessmentResultId': 104635,
            },
          ],
        });
        certification.update({ certificationIssueReports: [certificationIssueReport] });

        // when
        await visit(`/certifications/${certification.id}`);

        // then
        assert.dom('.card-text ul li').hasText('Problème sur une épreuve : L\'image ne s\'affiche pas - image disparue - Épreuve 666');
      });

    });

  });
});
