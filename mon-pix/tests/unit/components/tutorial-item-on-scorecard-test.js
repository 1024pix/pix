import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | tutorial item on scorecard', function() {
  setupTest();

  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:tutorial-item-on-scorecard');
  });

  describe('#displayedDuration', function() {

    it('should return the time only in hours if the duration time contains hours', function() {
      // given
      const tutorial = {
        id: 'recTuto1',
        format: 'video',
        duration: '08:23:32'
      };
      component.set('tutorial', tutorial);

      // when
      const result = component.get('displayedDuration');

      // then
      expect(result).to.equal('8 h');
    });

    it('should return the time only in minutes if the duration time contains minutes but 0 hours', function() {
      // given
      const tutorial = {
        id: 'recTuto1',
        format: 'video',
        duration: '00:04:32'
      };
      component.set('tutorial', tutorial);

      // when
      const result = component.get('displayedDuration');

      // then
      expect(result).to.equal('4 min');
    });

    it('should return 1 min if the duration time contains 0 minutes or hours', function() {
      // given
      const tutorial = {
        id: 'recTuto1',
        format: 'video',
        duration: '00:00:32'
      };
      component.set('tutorial', tutorial);

      // when
      const result = component.get('displayedDuration');

      // then
      expect(result).to.equal('1 min');
    });

  });

  describe('#formatImageName', function() {

    ['son', 'page'].forEach((format) => {
      it(`should return the same name "${format}" to display the image`, function() {
        // given
        const tutorial = {
          format: format,
        };
        component.set('tutorial', tutorial);

        // when
        const result = component.get('formatImageName');

        // then
        expect(result).to.equal(format);
      });
    });

    it('should return "video" when format is "vidéo"', function() {
      // given
      const tutorial = {
        format: 'vidéo',
      };
      component.set('tutorial', tutorial);

      // when
      const result = component.get('formatImageName');

      // then
      expect(result).to.equal('video');
    });

    it('should return the default value "page" when is not precise format', function() {
      // given
      const tutorial = {
        format: 'site',
      };
      component.set('tutorial', tutorial);

      // when
      const result = component.get('formatImageName');

      // then
      expect(result).to.equal('page');
    });
  });
});
