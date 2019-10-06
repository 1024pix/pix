import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certification-session-report', function(hooks) {

  setupRenderingTest(hooks);

  module('Rendering', function() {
    test('it renders', async function(assert) {
      // given
      this.set('visible', true);
      this.set('onHide', function() {});
      this.set('onGetJuryFile', function() {});
      this.set('onSaveReportData', function() {});
      this.set('candidateData', []);
      this.set('certificationData', []);

      // when
      await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile saveCandidates=onSaveReportData candidates=candidateData certifications=certificationData}}`);

      // then
      assert.dom('.certification-session-report__body').exists();
    });
  });

  module('When given a list of candidates in JSON', function() {

    test('it counts candidates and displays their certification ids', async function(assert) {

      // given
      this.set('candidateData', [{
        birthdate: '2000-02-20',
        birthplace: 'Paris',
        certificationId: '33347',
        email: 'firstname.name@mail.com',
        externalId: '123455',
        firstName: 'Toto',
        lastName: 'Le Héros',
        row: 1
      },{
        birthdate: '2000-03-20',
        birthplace: 'Toulouse',
        certificationId: '33348',
        email: 'firstname.name@mail.com',
        externalId: '123456',
        firstName: 'Titi',
        lastName: 'Romi',
        row: 2
      },{
        birthdate: '2000-01-20',
        birthplace: 'Bordeaux',
        certificationId: '33349',
        email: 'firstname.name@mail.com',
        externalId: '123458',
        firstName: 'Cats',
        lastName: 'Eyes',
        row: 3
      }]);
      this.set('visible', true);
      this.set('onHide', function() {});
      this.set('onGetJuryFile', function() {});
      this.set('onSaveReportData', function() {});
      this.set('certificationData', []);

      // when
      await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile saveCandidates=onSaveReportData candidates=candidateData certifications=certificationData}}`);
      await click('.data-section--listed-candidates .data-section__switch');

      // then
      assert.dom('.data-section--listed-candidates .data-section__counter').hasText('3');
      assert.dom('.data-section--listed-candidates .data-section__certification-ids').includesText('33347');
      assert.dom('.data-section--listed-candidates .data-section__certification-ids').includesText('33348');
      assert.dom('.data-section--listed-candidates .data-section__certification-ids').includesText('33349');
    });

    test('it detects candidates with incomplete information and displays their certification ids', async function(assert) {
      // given
      this.set('candidateData', [{
        birthdate: '2000-02-20',
        birthplace: 'Paris',
        certificationId: '33347',
        email: 'firstname.name@mail.com',
        externalId: '123455',
        firstName: 'Toto',
        lastName: '',
        row: 1
      },{
        birthdate: '2000-03-20',
        birthplace: '',
        certificationId: '33348',
        email: 'firstname.name@mail.com',
        externalId: '123456',
        firstName: 'Titi',
        lastName: 'Romi',
        row: 2
      },{
        birthdate: '2000-01-20',
        birthplace: 'Bordeaux',
        certificationId: '33349',
        email: 'firstname.name@mail.com',
        externalId: '123458',
        firstName: 'Cats',
        lastName: 'Eyes',
        row: 3
      },{
        birthdate: '2000-01-20',
        birthplace: 'Bordeaux',
        email: 'firstname.name@mail.com',
        externalId: '123458',
        firstName: 'Cats',
        lastName: 'Eyes',
        row: 4
      }]);
      this.set('visible', true);
      this.set('onHide', function() {});
      this.set('onGetJuryFile', function() {});
      this.set('onSaveReportData', function() {});
      this.set('certificationData', []);

      // when
      await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile saveCandidates=onSaveReportData candidates=candidateData certifications=certificationData}}`);
      await click('.data-section--incomplete-candidates .data-section__switch');

      // then
      assert.dom('.data-section--incomplete-candidates .data-section__counter').hasText('3');
      assert.dom('.data-section--incomplete-candidates .data-section__certification-ids').includesText('33347');
      assert.dom('.data-section--incomplete-candidates .data-section__certification-ids').includesText('33348');
    });

    test('it detects and displays duplicate certification ids', async function(assert) {
      // given
      this.set('candidateData', [{
        birthdate: '2000-02-20',
        birthplace: 'Paris',
        certificationId: '33347',
        email: 'firstname.name@mail.com',
        externalId: '123455',
        firstName: 'Toto',
        lastName: 'Le Héros',
        row: 1
      },{
        birthdate: '2000-03-20',
        birthplace: 'Toulouse',
        certificationId: '33347',
        email: 'firstname.name@mail.com',
        externalId: '123456',
        firstName: 'Titi',
        lastName: 'Romi',
        row: 2
      },{
        birthdate: '2000-01-20',
        birthplace: 'Bordeaux',
        certificationId: '33349',
        email: 'firstname.name@mail.com',
        externalId: '123458',
        firstName: 'Cats',
        lastName: 'Eyes',
        row: 3
      }]);
      this.set('visible', true);
      this.set('onHide', function() {});
      this.set('onGetJuryFile', function() {});
      this.set('onSaveReportData', function() {});
      this.set('certificationData', []);

      // when
      await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile saveCandidates=onSaveReportData candidates=candidateData certifications=certificationData}}`);
      await click('.data-section--duplicate-candidates .data-section__switch');

      //then
      assert.dom('.data-section--duplicate-candidates .data-section__counter').hasText('1');
      assert.dom('.data-section--duplicate-candidates .data-section__certification-ids').includesText('33347');
    });

    test('it detects candidates with missing information for end screen column', async function(assert) {
      // given
      this.set('candidateData', [{
        birthdate: '2000-02-20',
        birthplace: 'Paris',
        certificationId: '33347',
        email: 'firstname.name@mail.com',
        externalId: '123455',
        firstName: 'Toto',
        lastName: '',
        row: 1
      },{
        birthdate: '2000-03-20',
        birthplace: '',
        certificationId: '33348',
        email: 'firstname.name@mail.com',
        externalId: '123456',
        firstName: 'Titi',
        lastName: 'Romi',
        row: 2,
        lastScreen:'X'
      }]);
      this.set('visible', true);
      this.set('onHide', function() {});
      this.set('onGetJuryFile', function() {});
      this.set('onSaveReportData', function() {});
      this.set('certificationData', []);

      // when
      await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile saveCandidates=onSaveReportData candidates=candidateData certifications=certificationData}}`);
      await click('.data-section--missing-end-screen .data-section__switch');

      //then
      assert.dom('.data-section--missing-end-screen .data-section__counter').hasText('1');
      assert.dom('.data-section--missing-end-screen .data-section__certification-ids').includesText('33347');
    });

    test('it detects provided comments and displays corresponding certification ids', async function(assert) {
      // given
      this.set('candidateData', [{
        birthdate: '2000-02-20',
        birthplace: 'Paris',
        certificationId: '33347',
        email: 'firstname.name@mail.com',
        externalId: '123455',
        firstName: 'Toto',
        lastName: '',
        row: 1,
        comments: 'a comment'
      },{
        birthdate: '2000-03-20',
        birthplace: '',
        certificationId: '33348',
        email: 'firstname.name@mail.com',
        externalId: '123456',
        firstName: 'Titi',
        lastName: 'Romi',
        row: 2,
        lastScreen:'X'
      },{
        birthdate: '2000-01-20',
        birthplace: 'Bordeaux',
        email: 'firstname.name@mail.com',
        externalId: '123458',
        firstName: 'Cats',
        lastName: 'Eyes',
        certificationId: '33351',
        row: 3,
        comments: 'another comment'
      }]);
      this.set('visible', true);
      this.set('onHide', function() {});
      this.set('onGetJuryFile', function() {});
      this.set('onSaveReportData', function() {});
      this.set('certificationData', []);

      // when
      await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile saveCandidates=onSaveReportData candidates=candidateData certifications=certificationData}}`);
      await click('.data-section--comments .data-section__switch');

      //then
      assert.dom('.data-section--comments .data-section__counter').hasText('2');
      assert.dom('.data-section--comments .data-section__certification-ids').includesText('33347');
      assert.dom('.data-section--comments .data-section__certification-ids').includesText('33351');
    });

    module('When given the list of certifications from the session', function() {

      test('it finds candidates not related to the certification session and displays corresponding certification ids', async function(assert) {

        //given
        this.set('candidateData', [{
          birthdate: '2000-02-20',
          birthplace: 'Paris',
          certificationId: '33347',
          email: 'firstname.name@mail.com',
          externalId: '123455',
          firstName: 'Toto',
          lastName: 'Le Héros',
          row: 1
        },{
          birthdate: '2000-03-20',
          birthplace: 'Toulouse',
          certificationId: '33348',
          email: 'firstname.name@mail.com',
          externalId: '123456',
          firstName: 'Titi',
          lastName: 'Romi',
          row: 2
        },{
          birthdate: '2000-01-20',
          birthplace: 'Bordeaux',
          certificationId: '33349',
          email: 'firstname.name@mail.com',
          externalId: '123458',
          firstName: 'Cats',
          lastName: 'Eyes',
          row: 3
        }]);
        this.set('certificationData', [{ id:'33347' }, { id:'33349' }]);
        this.set('visible', true);
        this.set('onHide', function() {});
        this.set('onGetJuryFile', function() {});
        this.set('onSaveReportData', function() {});

        // when
        await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile saveCandidates=onSaveReportData candidates=candidateData certifications=certificationData}}`);
        await click('.data-section--unexpected-candidates .data-section__switch');

        // then
        assert.dom('.data-section--unexpected-candidates .data-section__counter').hasText('1');
        assert.dom('.data-section--unexpected-candidates .data-section__certification-ids').includesText('33348');
      });

      test('it finds certifications that are missing candidate information', async function(assert) {

        //given
        this.set('candidateData', [{
          birthdate: '2000-02-20',
          birthplace: 'Paris',
          certificationId: '33347',
          email: 'firstname.name@mail.com',
          externalId: '123455',
          firstName: 'Toto',
          lastName: 'Le Héros',
          row: 1
        },{
          birthdate: '2000-03-20',
          birthplace: 'Toulouse',
          certificationId: '33348',
          email: 'firstname.name@mail.com',
          externalId: '123456',
          firstName: 'Titi',
          lastName: 'Romi',
          row: 2
        },{
          birthdate: '2000-01-20',
          birthplace: 'Bordeaux',
          certificationId: '33349',
          email: 'firstname.name@mail.com',
          externalId: '123458',
          firstName: 'Cats',
          lastName: 'Eyes',
          row: 3
        }]);
        this.set('certificationData', [{ id:'33347' }, { id:'33350' }]);
        this.set('visible', true);
        this.set('onHide', function() {});
        this.set('onGetJuryFile', function() {});
        this.set('onSaveReportData', function() {});

        // when
        await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile saveCandidates=onSaveReportData candidates=candidateData certifications=certificationData}}`);
        await click('.data-section--missing-candidates .data-section__switch');

        // then
        assert.dom('.data-section--missing-candidates .data-section__counter').hasText('1');
        assert.dom('.data-section--missing-candidates .data-section__certification-ids').includesText('33350');
      });
    });
  });
});
