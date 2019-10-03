import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

describe('Integration | Component | Board page', function() {
  setupRenderingTest();

  context('On component rendering', function() {
    const organization = { id: 1 };

    beforeEach(function() {
      this.set('organization', organization);
      this.owner.register('service:session', Service.extend({
        data: {
          authenticated: {
            access_token: 'VALID-TOKEN',
          }
        },
      }));
    });

    it('should render component container', async function() {
      // given
      const snapshots = {
        data: [],
        meta: { rowCount: 2 },
      };
      this.set('snapshots', snapshots);

      // when
      await render(hbs`{{routes/board-page organization=organization snapshots=snapshots}}`);

      // then
      expect(find('.too-many-snapshots')).to.not.exist;
      expect(find('.profiles-title__export-csv').getAttribute('href')).to.equal(
        'http://localhost:3000/api/organizations/1/snapshots/export?userToken=VALID-TOKEN'
      );
    });

    it('should render component with tooManySnapshots', async function() {
      // given
      const snapshots = {
        data: [],
        meta: { rowCount: 201 },
      };
      this.set('snapshots', snapshots);

      // when
      await render(hbs`{{routes/board-page organization=organization snapshots=snapshots}}`);

      // then
      expect(find('.too-many-snapshots')).to.exist;
    });
  });
});
