import '../../test-helper';
import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';

describeModel(
  'assessment',
  'Unit | Model | Assessment',
  {
    needs: [
      'model:course',
      'model:answer',
      'model:challenge',
      'serializer:assessment'
    ]
  }, function () {

    it('exists', function () {
      let model = this.subject();
      expect(model).to.be.ok;
    });

    describe('#numberOfValidatedAnswers', function () {

      it('should return 0 if there is no answers', function () {
        // given
        const assessment = this.subject();

        // when
        const answers = assessment.get('numberOfValidatedAnswers');

        //then
        expect(answers).to.equal(0);
      });

      it('should count all validated answers', function () {
        Ember.run(() => {
          // given
          const store = this.store();
          const assessment = this.subject();
          store.createRecord('answer', { value: "Xi", assessment });
          store.createRecord('answer', { value: "Fu", assessment });
          store.createRecord('answer', { value: "Mi", assessment });

          // when
          const answers = assessment.get('numberOfValidatedAnswers');

          //then
          expect(answers).to.equal(3);
        });
      });

      it('should not include skipped challenge answers', function () {
        Ember.run(() => {
          // given
          const store = this.store();
          const assessment = this.subject();
          store.createRecord('answer', { value: "Xi", assessment });
          store.createRecord('answer', { value: "#ABAND#", assessment });
          store.createRecord('answer', { value: "Mi", assessment });

          // when
          const answers = assessment.get('numberOfValidatedAnswers');

          //then
          expect(answers).to.equal(2);
        });
      });
    });

    describe('#serialize', function () {

      it('includes course ID', function () {
        Ember.run(() => {
          // given
          const courseId = 'rec1234567890';
          const course = this.store().createRecord('course', { id: courseId });
          const assessment = this.subject({ course });

          // when
          const serializedData = assessment.serialize();

          // then
          expect(serializedData["Test"]).to.deep.equal([courseId]);
        });
      });

      it("includes user's name and email", function () {
        // given
        const assessment = this.subject({
          userEmail: 'toto@plop.com',
          userName: 'Toto'
        });

        // when
        const serializedData = assessment.serialize();

        // then
        expect(serializedData["Nom de l'usager"]).to.equal('Toto');
        expect(serializedData["Courriel de l'usager"]).to.equal('toto@plop.com');
      });

    });
  }
);

