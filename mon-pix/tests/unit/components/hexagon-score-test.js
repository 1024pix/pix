import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import Service from '@ember/service';

describe('Unit | Component | hexagon score', function() {

  setupTest();

  describe('Hexagon First April Edition ©', function() {

    beforeEach(function() {
      this.clock = sinon.useFakeTimers();
    });

    afterEach(function() {
      this.clock.restore();
    }),

    context('when April Fool feature is enabled', function() {
      beforeEach(function() {
        class FeatureTogglesStub extends Service {
          constructor() {
            super(...arguments);
            this.featureToggles = {
              isAprilFoolEnabled: true,
            };
          }
        }

        this.owner.register('service:featureToggles', FeatureTogglesStub);
      });

      it('should decrement the pix score', function() {
      // given
        const pixScore = 10;

        const component = createGlimmerComponent('component:hexagon-score', { pixScore });

        expect(component.score).to.equal(10);

        // when
        this.clock.tick(500);

        // then
        expect(component.score).to.equal(9);
      });

      it('STOP THE COUNT at -999', function() {
        const pixScore = -998;

        const component = createGlimmerComponent('component:hexagon-score', { pixScore });

        // when
        this.clock.tick(5000);

        // then
        expect(component.score).to.equal(-999);
      });

      it('restores the counter', function() {
        const pixScore = 10;

        const component = createGlimmerComponent('component:hexagon-score', { pixScore });

        // when
        this.clock.tick(5000);
        component.restorePixScore();
        this.clock.tick(5000);

        // then
        expect(component.score).to.equal(10);
      });

      it('adds april-fool class', function() {
      // given
        const component = createGlimmerComponent('component:hexagon-score');

        // when
        const aprilFoolClass = component.aprilFoolClass;

        // then
        expect(aprilFoolClass).to.equal('april-fool');
      });
    });

    context('when April Fool feature is not enabled', function() {
      beforeEach(function() {
        class FeatureTogglesStub extends Service {
          constructor() {
            super(...arguments);
            this.featureToggles = {
              isAprilFoolEnabled: false,
            };
          }
        }

        this.owner.register('service:featureToggles', FeatureTogglesStub);
      });

      it('should not decrement the pix score', function() {
        // given
        const pixScore = 10;

        const component = createGlimmerComponent('component:hexagon-score', { pixScore });

        expect(component.score).to.equal(10);

        // when
        this.clock.tick(500);

        // then
        expect(component.score).to.equal(10);
      });

      it('does not add april-fool class', function() {
      // given
        const component = createGlimmerComponent('component:hexagon-score');

        // when
        const aprilFoolClass = component.aprilFoolClass;

        // then
        expect(aprilFoolClass).to.equal('');
      });
    });
  });
});
