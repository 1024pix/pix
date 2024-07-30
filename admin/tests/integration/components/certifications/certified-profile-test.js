import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | certifications/certified-profile', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display Profil certifié vide if the certified profile is empty', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certifiedAreas = [];
    const certifiedProfile = store.createRecord('certified-profile', {
      certifiedAreas,
    });
    this.set('certifiedProfile', certifiedProfile);

    // when
    const screen = await render(hbs`<Certifications::CertifiedProfile @certifiedProfile={{this.certifiedProfile}} />`);

    // then
    assert.dom(screen.getByText('Profil certifié vide.')).exists();
  });

  module('when certified profile is not empty', function () {
    test('it should display one column per difficulty levels within a competence', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certifiedArea = store.createRecord('certified-area', {
        id: 'idArea1',
        name: 'area1',
      });
      const certifiedCompetence = store.createRecord('certified-competence', {
        name: 'competence1',
        areaId: 'idArea1',
      });
      const certifiedProfile = store.createRecord('certified-profile', {
        certifiedAreas: [certifiedArea],
        certifiedCompetences: [certifiedCompetence],
      });
      this.set('certifiedProfile', certifiedProfile);

      // when
      const screen = await render(
        hbs`<Certifications::CertifiedProfile @certifiedProfile={{this.certifiedProfile}} />`,
      );

      // then
      assert.dom(screen.getByText('Niveau 1')).exists();
      assert.dom(screen.getByText('Niveau 2')).exists();
      assert.dom(screen.getByText('Niveau 3')).exists();
      assert.dom(screen.getByText('Niveau 4')).exists();
      assert.dom(screen.getByText('Niveau 5')).exists();
      assert.dom(screen.getByText('Niveau 6')).exists();
      assert.dom(screen.getByText('Niveau 7')).exists();
      assert.dom(screen.getByText('Niveau 8')).exists();
    });

    test('it should display data about area and competence', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certifiedArea = store.createRecord('certified-area', {
        id: 'idArea1',
        name: 'area1',
      });
      const certifiedCompetence = store.createRecord('certified-competence', {
        name: 'competence1',
        areaId: 'idArea1',
      });
      const certifiedProfile = store.createRecord('certified-profile', {
        certifiedAreas: [certifiedArea],
        certifiedCompetences: [certifiedCompetence],
      });
      this.set('certifiedProfile', certifiedProfile);

      // when
      const screen = await render(
        hbs`<Certifications::CertifiedProfile @certifiedProfile={{this.certifiedProfile}} />`,
      );

      // then
      assert.dom(screen.getByText('area1')).exists();
      assert.dom(screen.getByText('competence1')).exists();
    });

    test('it should display the expected iconography depending on the state of the skill in a tube', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certifiedArea = store.createRecord('certified-area', {
        id: 'idArea1',
        name: 'area1',
      });
      const certifiedCompetence = store.createRecord('certified-competence', {
        id: 'idCompetence1',
        name: 'competence1',
        areaId: 'idArea1',
      });
      const certifiedTube = store.createRecord('certified-tube', {
        id: 'idTube1',
        name: 'tube1',
        competenceId: 'idCompetence1',
      });
      const certifiedSkillInCertificationTest = store.createRecord('certified-skill', {
        id: 'idSkill1',
        name: 'skill1',
        tubeId: 'idTube1',
        hasBeenAskedInCertif: true,
        difficulty: 1,
      });
      const certifiedSkillNotInCertificationTest = store.createRecord('certified-skill', {
        id: 'idSkill2',
        name: 'skill2',
        tubeId: 'idTube1',
        hasBeenAskedInCertif: false,
        difficulty: 2,
      });
      const certifiedProfile = store.createRecord('certified-profile', {
        certifiedAreas: [certifiedArea],
        certifiedCompetences: [certifiedCompetence],
        certifiedTubes: [certifiedTube],
        certifiedSkills: [certifiedSkillInCertificationTest, certifiedSkillNotInCertificationTest],
      });
      this.set('certifiedProfile', certifiedProfile);

      // when
      const screen = await render(
        hbs`<Certifications::CertifiedProfile @certifiedProfile={{this.certifiedProfile}} />`,
      );

      // then
      assert.dom(screen.getByText('tube1')).exists();
      const iconSkill1 = screen.getByLabelText('skill1').getAttribute('data-icon');
      const iconSkill2 = screen.getByLabelText('skill2').getAttribute('data-icon');
      assert.strictEqual(iconSkill1, 'check-double');
      assert.strictEqual(iconSkill2, 'check');
    });
    test('it should display non Pix competences first', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certifiedArea1 = store.createRecord('certified-area', {
        id: 'idArea1',
        name: 'area1',
      });

      const certifiedArea2 = store.createRecord('certified-area', {
        id: 'idArea2',
        name: 'area2',
      });

      const certifiedPixCompetenceCompetence = store.createRecord('certified-competence', {
        name: 'competencePix',
        areaId: 'idArea1',
        origin: 'Pix',
      });

      const certifiedNonPixCompetence = store.createRecord('certified-competence', {
        name: 'competenceNonPix',
        areaId: 'idArea2',
        origin: 'Autre',
      });

      const certifiedProfile = store.createRecord('certified-profile', {
        certifiedAreas: [certifiedArea1, certifiedArea2],
        certifiedCompetences: [certifiedPixCompetenceCompetence, certifiedNonPixCompetence],
      });

      this.set('certifiedProfile', certifiedProfile);

      // when
      const screen = await render(
        hbs`<Certifications::CertifiedProfile @certifiedProfile={{this.certifiedProfile}} />`,
      );

      // then
      const [firstCompetenceTitle, secondCompetenceTitle] = screen.getAllByRole('heading');

      assert.strictEqual(firstCompetenceTitle.innerText, 'competenceNonPix');
      assert.strictEqual(secondCompetenceTitle.innerText, 'competencePix');
    });
  });
});
