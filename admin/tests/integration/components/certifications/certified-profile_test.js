import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certifications/certified-profile', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display Profil certifié vide if the certified profile is empty', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certifiedAreas = [];
    const certifiedProfile = run(() =>
      store.createRecord('certified-profile', {
        certifiedAreas,
      })
    );
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
      const certifiedArea = run(() =>
        store.createRecord('certified-area', {
          id: 'idArea1',
          name: 'area1',
        })
      );
      const certifiedCompetence = run(() =>
        store.createRecord('certified-competence', {
          name: 'competence1',
          areaId: 'idArea1',
        })
      );
      const certifiedProfile = run(() =>
        store.createRecord('certified-profile', {
          certifiedAreas: [certifiedArea],
          certifiedCompetences: [certifiedCompetence],
        })
      );
      this.set('certifiedProfile', certifiedProfile);

      // when
      const screen = await render(
        hbs`<Certifications::CertifiedProfile @certifiedProfile={{this.certifiedProfile}} />`
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
      const certifiedArea = run(() =>
        store.createRecord('certified-area', {
          id: 'idArea1',
          name: 'area1',
        })
      );
      const certifiedCompetence = run(() =>
        store.createRecord('certified-competence', {
          name: 'competence1',
          areaId: 'idArea1',
        })
      );
      const certifiedProfile = run(() =>
        store.createRecord('certified-profile', {
          certifiedAreas: [certifiedArea],
          certifiedCompetences: [certifiedCompetence],
        })
      );
      this.set('certifiedProfile', certifiedProfile);

      // when
      const screen = await render(
        hbs`<Certifications::CertifiedProfile @certifiedProfile={{this.certifiedProfile}} />`
      );

      // then
      assert.dom(screen.getByText('area1')).exists();
      assert.dom(screen.getByText('competence1')).exists();
    });

    test('it should display the expected iconography depending on the state of the skill in a tube', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certifiedArea = run(() =>
        store.createRecord('certified-area', {
          id: 'idArea1',
          name: 'area1',
        })
      );
      const certifiedCompetence = run(() =>
        store.createRecord('certified-competence', {
          id: 'idCompetence1',
          name: 'competence1',
          areaId: 'idArea1',
        })
      );
      const certifiedTube = run(() =>
        store.createRecord('certified-tube', {
          id: 'idTube1',
          name: 'tube1',
          competenceId: 'idCompetence1',
        })
      );
      const certifiedSkillInCertificationTest = run(() =>
        store.createRecord('certified-skill', {
          id: 'idSkill1',
          name: 'skill1',
          tubeId: 'idTube1',
          hasBeenAskedInCertif: true,
          difficulty: 1,
        })
      );
      const certifiedSkillNotInCertificationTest = run(() =>
        store.createRecord('certified-skill', {
          id: 'idSkill2',
          name: 'skill2',
          tubeId: 'idTube1',
          hasBeenAskedInCertif: false,
          difficulty: 2,
        })
      );
      const certifiedProfile = run(() =>
        store.createRecord('certified-profile', {
          certifiedAreas: [certifiedArea],
          certifiedCompetences: [certifiedCompetence],
          certifiedTubes: [certifiedTube],
          certifiedSkills: [certifiedSkillInCertificationTest, certifiedSkillNotInCertificationTest],
        })
      );
      this.set('certifiedProfile', certifiedProfile);

      // when
      const screen = await render(
        hbs`<Certifications::CertifiedProfile @certifiedProfile={{this.certifiedProfile}} />`
      );

      // then
      assert.dom(screen.getByText('tube1')).exists();
      const iconSkill1 = screen.getByLabelText('skill1').getAttribute('data-icon');
      const iconSkill2 = screen.getByLabelText('skill2').getAttribute('data-icon');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(iconSkill1, 'check-double');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(iconSkill2, 'check');
    });
  });
});
