import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { setBreakpoint } from 'ember-responsive/test-support';

describe('Integration | Component | Profile-content', function() {
  setupRenderingTest();

  context('On component rendering', function() {
    let model;

    beforeEach(function() {
      this.owner.register('service:session', Service.extend({
        data: {
          authenticated: {
            access_token: 'VALID-TOKEN',
          }
        },
      }));

      model = {
        pixScore: {
          value: '34',
        },
        areasCode: [0, 1],
        scorecards: [
          {
            id: 1,
            areaColor: 0,
            level: 3,
            name: 'Name',
            percentageAheadOfNextLevel: 0.5,
            area: {
              code: 0,
              title: 'Area title',
            },
          },
          {
            id: 2,
            areaColor: 1,
            level: 2,
            name: 'Name 2',
            percentageAheadOfNextLevel: 0.5,
            area: {
              code: 1,
              title: 'Area title 2',
            },
          },
        ],
      };

    });

    context('When user is on tablet/desktop ', function() {
      it('should be rendered in tablet/desktop mode with big cards', async function() {
        // when
        setBreakpoint('tablet');
        this.set('model', model);
        this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
        await render(hbs`{{profile-content model=model media=media}}`);

        // then
        expect(find('.competence-card')).to.exist;
        expect(find('.score-label')).to.exist;
        expect(find('.competence-card__footer')).to.exist;
      });
    });

    context('When user is on mobile', function() {
      it('should be rendered in mobile mode with small cards', async function() {
        // when
        setBreakpoint('mobile');
        this.set('model', model);
        this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
        await render(hbs`{{profile-content model=model media=media}}`);

        // then
        expect(find('.competence-card')).to.exist;
        expect(find('.score-label')).to.not.exist;
        expect(find('.competence-card__footer')).to.not.exist;
      });
    });
  });
});
