import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import sinon from 'sinon';

describe('Unit | Component | Training | card', function () {
  setupTest();
  let store;

  beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  describe('#durationFormatted', function () {
    [
      {
        duration: {
          hours: 10,
          minutes: 11,
          seconds: 12,
        },
        expectedResult: '10h 11m 12s',
      },
      {
        duration: {
          hours: 10,
        },
        expectedResult: '10h',
      },
      {
        duration: {
          minutes: 11,
        },
        expectedResult: '11m',
      },
      {
        duration: {
          seconds: 12,
        },
        expectedResult: '12s',
      },
      {
        duration: {
          minutes: 11,
          seconds: 12,
        },
        expectedResult: '11m 12s',
      },
      {
        duration: {
          hours: 10,
          seconds: 12,
        },
        expectedResult: '10h 12s',
      },
      {
        duration: {
          hours: 10,
          minutes: 11,
        },
        expectedResult: '10h 11m',
      },
    ].forEach(({ duration, expectedResult }) => {
      it(`should return ${expectedResult} for given duration ${JSON.stringify(duration)}`, function () {
        // given
        const training = store.createRecord('training', { duration });
        const component = createGlimmerComponent('component:training/card', { training });

        // when
        const result = component.durationFormatted;

        // then
        expect(result).to.equal(expectedResult);
      });
    });
  });

  describe('#imageSrc', function () {
    it('should return appropriate image src for training type webinaire', function () {
      // given
      const training = store.createRecord('training', { type: 'webinaire' });
      const component = createGlimmerComponent('component:training/card', { training });
      const getRandomImageNumberSpy = sinon.spy(component, '_getRandomImageNumber');

      // when
      const result = component.imageSrc;

      // then
      expect(result).to.match(new RegExp(/\/images\/illustrations\/trainings\/Illu_Webinaire-[1-3].png/g));
      expect(getRandomImageNumberSpy.called).to.be.true;
    });

    it('should return appropriate image src for training type autoformation', function () {
      // given
      const training = store.createRecord('training', { type: 'autoformation' });
      const component = createGlimmerComponent('component:training/card', { training });
      const getRandomImageNumberSpy = sinon.spy(component, '_getRandomImageNumber');

      // when
      const result = component.imageSrc;

      // then
      expect(result).to.match(new RegExp(/\/images\/illustrations\/trainings\/Illu_Parcours_autoformation-[1-3].png/g));
      expect(getRandomImageNumberSpy.called).to.be.true;
    });
  });

  describe('#tagColor', function () {
    it('should return appropriate tag color for given type webinaire', function () {
      // given
      const training = store.createRecord('training', { type: 'webinaire' });
      const component = createGlimmerComponent('component:training/card', { training });

      // when
      const result = component.tagColor;

      // then
      expect(result).to.equal('purple-light');
    });

    it('should return appropriate tag color for given type autoformation', function () {
      // given
      const training = store.createRecord('training', { type: 'autoformation' });
      const component = createGlimmerComponent('component:training/card', { training });

      // when
      const result = component.tagColor;

      // then
      expect(result).to.equal('blue-light');
    });
  });
});
