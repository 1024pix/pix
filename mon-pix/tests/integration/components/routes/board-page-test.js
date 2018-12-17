import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

describe('Integration | Component | Board page', function() {
  setupComponentTest('board-page', {
    integration: true
  });

  context('On component rendering', function() {
    const organization = { id: 1 };

    beforeEach(function() {
      this.set('organization', organization);
      this.register('service:session', Service.extend({
        data: {
          authenticated: {
            token: 'VALID-TOKEN',
          }
        },
      }));
      this.inject.service('session', { as: 'session' });
    });

    it('should render component container', function() {
      // given
      const snapshots = {
        data: [],
        meta: { rowCount: 2 },
      };
      this.set('snapshots', snapshots);

      // when
      this.render(hbs`{{routes/board-page organization=organization snapshots=snapshots}}`);

      // then
      expect(this.$('.too-many-snapshots')).to.have.lengthOf(0);
      expect(this.$('.profiles-title__export-csv').attr('href')).to.equal(
        'http://localhost:3000/api/organizations/1/snapshots/export?userToken=VALID-TOKEN'
      );
    });

    it('should render component with tooManySnapshots', function() {
      // given
      const snapshots = {
        data: [],
        meta: { rowCount: 201 },
      };
      this.set('snapshots', snapshots);

      // when
      this.render(hbs`{{routes/board-page organization=organization snapshots=snapshots}}`);

      // then
      expect(this.$('.too-many-snapshots')).to.have.lengthOf(1);
    });
  });
});
