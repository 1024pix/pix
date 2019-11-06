import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | tutorial item on scorecard', function() {
  setupTest();

  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:tutorial-item-on-scorecard');
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
