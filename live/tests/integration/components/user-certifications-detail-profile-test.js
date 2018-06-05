import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | user certifications detail profile', function() {
  setupComponentTest('user-certifications-detail-profile', {
    integration: true,
  });

  let certification;

  it('renders', function() {
    this.render(hbs`{{user-certifications-detail-profile profile=profile}}`);
    expect(this.$()).to.have.length(1);
  });

  context('when are has a list of competences', function() {

    beforeEach(function() {
      // given
      certification =  {
        certifiedProfile: [
          {
            'area-name': 'Information et données',
            'area-index': '1',
          },
          {
            'area-name': 'Communication et collaboration',
            'area-index': '2',
          },
          {
            'area-name': 'Création de contenu',
            'area-index': '3',
          },
        ]
      };
      this.set('certification', certification);

      // when
      this.render(hbs`{{user-certifications-detail-profile certification=certification}}`);
    });

    it('should include one area detail per area', function() {
      // given
      const divOfArea = '.user-certifications-detail-area';

      // then
      expect(this.$(divOfArea)).to.have.lengthOf(certification.certifiedProfile.length);
    });
  });

});
