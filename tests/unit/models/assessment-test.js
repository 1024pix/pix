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

    describe('#serialize', function () {

      it('includes course ID', function() {
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

