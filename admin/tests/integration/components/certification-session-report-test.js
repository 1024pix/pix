import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | certification-session-report', function(hooks) {
  setupRenderingTest(hooks);

  module('Rendering', function() {
    test('it renders', async function(assert) {
      // given
      this.set('visible', true);
      this.set('onHide', function() {});
      this.set('onGetJuryFile', function() {});
      this.set('candidateData', []);
      this.set('certificationData', Promise.resolve([]));

      // when
      await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile candidates=candidateData certifications=certificationData}}`);

      // then
      assert.dom('form.session-report').exists();
    });
  });

  module('When given a list of candidates in JSON', function() {

    test('it counts candidates and displays their certification ids', async function(assert) {

      // given
      this.set('candidateData', [{
        birthDate: '20/02/2000',
        birthPlace: 'Paris',
        certificationId: 33347,
        email: 'firstname.name@mail.com',
        externalId: '123455',
        firstName: 'Toto',
        lastName: 'Le Héros',
        row: 1
      },{
        birthDate: '20/03/2000',
        birthPlace: 'Toulouse',
        certificationId: 33348,
        email: 'firstname.name@mail.com',
        externalId: '123456',
        firstName: 'Titi',
        lastName: 'Romi',
        row: 2
      },{
        birthDate: '20/01/2000',
        birthPlace: 'Bordeaux',
        certificationId: 33349,
        email: 'firstname.name@mail.com',
        externalId: '123458',
        firstName: 'Cats',
        lastName: 'Eyes',
        row: 3
      }]);
      this.set('visible', true);
      this.set('onHide', function() {});
      this.set('onGetJuryFile', function() {});
      this.set('certificationData', Promise.resolve([]));
      assert.expect(2);

      // when
      await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile candidates=candidateData certifications=certificationData}}`);
      this.$('#count-button').click();

      // then
      assert.dom('#count').hasValue('3');
      assert.dom('#count-details').hasText('33347 33348 33349');
    });

    test('it detects and displays duplicate certification ids', async function(assert) {
      // given
      this.set('candidateData', [{
        birthDate: '20/02/2000',
        birthPlace: 'Paris',
        certificationId: 33347,
        email: 'firstname.name@mail.com',
        externalId: '123455',
        firstName: 'Toto',
        lastName: 'Le Héros',
        row: 1
      },{
        birthDate: '20/03/2000',
        birthPlace: 'Toulouse',
        certificationId: 33347,
        email: 'firstname.name@mail.com',
        externalId: '123456',
        firstName: 'Titi',
        lastName: 'Romi',
        row: 2
      },{
        birthDate: '20/01/2000',
        birthPlace: 'Bordeaux',
        certificationId: 33349,
        email: 'firstname.name@mail.com',
        externalId: '123458',
        firstName: 'Cats',
        lastName: 'Eyes',
        row: 3
      }]);
      this.set('visible', true);
      this.set('onHide', function() {});
      this.set('onGetJuryFile', function() {});
      this.set('certificationData', Promise.resolve([]));
      assert.expect(2);

      // when
      await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile candidates=candidateData certifications=certificationData}}`);
      this.$('#duplicates-button').click();

      //then
      assert.dom('#duplicates').hasValue('1');
      assert.dom('#duplicates-details').hasText('33347');
    });

    test('it detects candidates with incomplete information and displays their certification ids', async function(assert) {
      // given
      this.set('candidateData', [{
        birthDate: '20/02/2000',
        birthPlace: 'Paris',
        certificationId: 33347,
        email: 'firstname.name@mail.com',
        externalId: '123455',
        firstName: 'Toto',
        lastName: '',
        row: 1
      },{
        birthDate: '20/03/2000',
        birthPlace: '',
        certificationId: 33348,
        email: 'firstname.name@mail.com',
        externalId: '123456',
        firstName: 'Titi',
        lastName: 'Romi',
        row: 2
      },{
        birthDate: '20/01/2000',
        birthPlace: 'Bordeaux',
        certificationId: 33349,
        email: 'firstname.name@mail.com',
        externalId: '123458',
        firstName: 'Cats',
        lastName: 'Eyes',
        row: 3
      },{
        birthDate: '20/01/2000',
        birthPlace: 'Bordeaux',
        email: 'firstname.name@mail.com',
        externalId: '123458',
        firstName: 'Cats',
        lastName: 'Eyes',
        row: 4
      }]);
      this.set('visible', true);
      this.set('onHide', function() {});
      this.set('onGetJuryFile', function() {});
      this.set('certificationData', Promise.resolve([]));
      assert.expect(2);

      // when
      await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile candidates=candidateData certifications=certificationData}}`);
      this.$('#incomplete-button').click();

      //then
      assert.dom('#incomplete').hasValue('3');
      assert.dom('#incomplete-details').hasText('33347 33348');
    });

    test('it detects candidates with missing information for end screen column', async function(assert) {
      // given
      this.set('candidateData', [{
        birthDate: '20/02/2000',
        birthPlace: 'Paris',
        certificationId: 33347,
        email: 'firstname.name@mail.com',
        externalId: '123455',
        firstName: 'Toto',
        lastName: '',
        row: 1
      },{
        birthDate: '20/03/2000',
        birthPlace: '',
        certificationId: 33348,
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
      this.set('certificationData', Promise.resolve([]));
      assert.expect(2);

      // when
      await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile candidates=candidateData certifications=certificationData}}`);
      this.$('#end-screen-button').click();

      //then
      assert.dom('#end-screen').hasValue('1');
      assert.dom('#end-screen-details').hasText('33347');
    });

    test('it detects provided comments and displays corresponding certification ids', async function(assert) {
      // given
      this.set('candidateData', [{
        birthDate: '20/02/2000',
        birthPlace: 'Paris',
        certificationId: 33347,
        email: 'firstname.name@mail.com',
        externalId: '123455',
        firstName: 'Toto',
        lastName: '',
        row: 1,
        comments: 'a comment'
      },{
        birthDate: '20/03/2000',
        birthPlace: '',
        certificationId: 33348,
        email: 'firstname.name@mail.com',
        externalId: '123456',
        firstName: 'Titi',
        lastName: 'Romi',
        row: 2,
        lastScreen:'X'
      },{
        birthDate: '20/01/2000',
        birthPlace: 'Bordeaux',
        email: 'firstname.name@mail.com',
        externalId: '123458',
        firstName: 'Cats',
        lastName: 'Eyes',
        certificationId: 33351,
        row: 3,
        comments: 'another comment'
      }]);
      this.set('visible', true);
      this.set('onHide', function() {});
      this.set('onGetJuryFile', function() {});
      this.set('certificationData', Promise.resolve([]));
      assert.expect(2);

      // when
      await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile candidates=candidateData certifications=certificationData}}`);
      this.$('#comments-button').click();

      //then
      assert.dom('#comments').hasValue('2');
      assert.dom('#comments-details').hasText('33347 33351');
    });

    module('When given the list of certifications from the session', function() {

      test('it finds candidates not related to the certification session and displays corresponding certification ids', async function(assert) {

        //given
        this.set('candidateData', [{
          birthDate: '20/02/2000',
          birthPlace: 'Paris',
          certificationId: 33347,
          email: 'firstname.name@mail.com',
          externalId: '123455',
          firstName: 'Toto',
          lastName: 'Le Héros',
          row: 1
        },{
          birthDate: '20/03/2000',
          birthPlace: 'Toulouse',
          certificationId: 33348,
          email: 'firstname.name@mail.com',
          externalId: '123456',
          firstName: 'Titi',
          lastName: 'Romi',
          row: 2
        },{
          birthDate: '20/01/2000',
          birthPlace: 'Bordeaux',
          certificationId: 33349,
          email: 'firstname.name@mail.com',
          externalId: '123458',
          firstName: 'Cats',
          lastName: 'Eyes',
          row: 3
        }]);
        this.set('certificationData', Promise.resolve([
          EmberObject.create({
            id:'33347'
          }),
          EmberObject.create({
            id:'33349'
          })
        ]));
        this.set('visible', true);
        this.set('onHide', function() {});
        this.set('onGetJuryFile', function() {});
        assert.expect(2);

        // when
        await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile candidates=candidateData certifications=certificationData}}`);
        this.$('#out-button').click();

        // then
        assert.dom('#out').hasValue('1');
        assert.dom('#out-details').hasText('33348');
      });

      test('it finds certifications that are missing candidate information', async function(assert) {

        //given
        this.set('candidateData', [{
          birthDate: '20/02/2000',
          birthPlace: 'Paris',
          certificationId: 33347,
          email: 'firstname.name@mail.com',
          externalId: '123455',
          firstName: 'Toto',
          lastName: 'Le Héros',
          row: 1
        },{
          birthDate: '20/03/2000',
          birthPlace: 'Toulouse',
          certificationId: 33348,
          email: 'firstname.name@mail.com',
          externalId: '123456',
          firstName: 'Titi',
          lastName: 'Romi',
          row: 2
        },{
          birthDate: '20/01/2000',
          birthPlace: 'Bordeaux',
          certificationId: 33349,
          email: 'firstname.name@mail.com',
          externalId: '123458',
          firstName: 'Cats',
          lastName: 'Eyes',
          row: 3
        }]);
        this.set('certificationData', Promise.resolve([
          EmberObject.create({
            id:'33347'
          }),
          EmberObject.create({
            id:'33350'
          })
        ]));
        this.set('visible', true);
        this.set('onHide', function() {});
        this.set('onGetJuryFile', function() {});
        assert.expect(2);

        // when
        await render(hbs`{{certification-session-report show=visible hide=onHide getJuryFile=onGetJuryFile candidates=candidateData certifications=certificationData}}`);
        this.$('#without-candidate-button').click();

        // then
        assert.dom('#without-candidate').hasValue('1');
        assert.dom('#without-candidate-details').hasText('33350');
      });
    });
  });
});
