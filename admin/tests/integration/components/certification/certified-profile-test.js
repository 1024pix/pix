import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | <Certification::CertifiedProfile/>', (hooks) => {

  setupRenderingTest(hooks);

  test('it should display Profil certifié vide if the certified profile is empty', async function(assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certifiedAreas = [];
    const certifiedProfile = run(() => store.createRecord('certified-profile', {
      certifiedAreas,
    }));
    this.set('certifiedProfile', certifiedProfile);

    // when
    await render(hbs`<Certification::CertifiedProfile @certifiedProfile={{this.certifiedProfile}} />`);

    // then
    assert.contains('Profil certifié vide.');
  });

  module('when certified profile is not empty', () => {
    test('it should display one column per difficulty levels within a competence', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certifiedArea = run(() => store.createRecord('certified-area', {
        id: 'idArea1',
        name: 'area1',
      }));
      const certifiedCompetence = run(() => store.createRecord('certified-competence', {
        name: 'competence1',
        areaId: 'idArea1',
      }));
      const certifiedProfile = run(() => store.createRecord('certified-profile', {
        certifiedAreas: [certifiedArea],
        certifiedCompetences: [certifiedCompetence],
      }));
      this.set('certifiedProfile', certifiedProfile);

      // when
      await render(hbs`<Certification::CertifiedProfile @certifiedProfile={{this.certifiedProfile}} />`);

      // then
      assert.contains('Niveau 1');
      assert.contains('Niveau 2');
      assert.contains('Niveau 3');
      assert.contains('Niveau 4');
      assert.contains('Niveau 5');
      assert.contains('Niveau 6');
      assert.contains('Niveau 7');
      assert.contains('Niveau 8');
    });

    test('it should display data about area and competence', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certifiedArea = run(() => store.createRecord('certified-area', {
        id: 'idArea1',
        name: 'area1',
      }));
      const certifiedCompetence = run(() => store.createRecord('certified-competence', {
        name: 'competence1',
        areaId: 'idArea1',
      }));
      const certifiedProfile = run(() => store.createRecord('certified-profile', {
        certifiedAreas: [certifiedArea],
        certifiedCompetences: [certifiedCompetence],
      }));
      this.set('certifiedProfile', certifiedProfile);

      // when
      await render(hbs`<Certification::CertifiedProfile @certifiedProfile={{this.certifiedProfile}} />`);

      // then
      assert.contains('area1');
      assert.contains('competence1');
    });

    test('it should display the expected iconography depending on the state of the skill in a tube', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certifiedArea = run(() => store.createRecord('certified-area', {
        id: 'idArea1',
        name: 'area1',
      }));
      const certifiedCompetence = run(() => store.createRecord('certified-competence', {
        id: 'idCompetence1',
        name: 'competence1',
        areaId: 'idArea1',
      }));
      const certifiedTube = run(() => store.createRecord('certified-tube', {
        id: 'idTube1',
        name: 'tube1',
        competenceId: 'idCompetence1',
      }));
      const certifiedSkillInCertificationTest = run(() => store.createRecord('certified-skill', {
        id: 'idSkill1',
        name: 'skill1',
        tubeId: 'idTube1',
        hasBeenAskedInCertif: true,
        difficulty: 1,
      }));
      const certifiedSkillNotInCertificationTest = run(() => store.createRecord('certified-skill', {
        id: 'idSkill2',
        name: 'skill2',
        tubeId: 'idTube1',
        hasBeenAskedInCertif: false,
        difficulty: 2,
      }));
      const certifiedProfile = run(() => store.createRecord('certified-profile', {
        certifiedAreas: [certifiedArea],
        certifiedCompetences: [certifiedCompetence],
        certifiedTubes: [certifiedTube],
        certifiedSkills: [certifiedSkillInCertificationTest, certifiedSkillNotInCertificationTest],
      }));
      this.set('certifiedProfile', certifiedProfile);

      // when
      await render(hbs`<Certification::CertifiedProfile @certifiedProfile={{this.certifiedProfile}} />`);

      // then
      const iconSkill1 = find('[aria-label="skill1"]').getAttribute('data-icon');
      const iconSkill2 = find('[aria-label="skill2"]').getAttribute('data-icon');
      assert.contains('tube1');
      assert.equal(iconSkill1, 'check-double');
      assert.equal(iconSkill2, 'check');
    });
  });
});
