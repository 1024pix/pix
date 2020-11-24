import { describe, beforeEach } from 'mocha';
import { expect } from 'chai';

import { click, find, render } from '@ember/test-helpers';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';
import { reject } from 'rsvp';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import sinon from 'sinon';

describe('Integration | Component | routes/campaigns/assessment/skill-review', function() {

  setupIntlRenderingTest();

  beforeEach(function() {
    class storeStub extends Service {
      createRecord() {
        return Object.create({
          save() {
            return reject();
          },
        });
      }
    }
    class sessionStub extends Service {}

    this.owner.register('service:session', sessionStub);
    this.owner.register('service:store', storeStub);
  });

  context('When user want to share his/her results', function() {
    context('when a skill has been reset after campaign completion and before sending results', function() {
      it('should see the button to share', async function() {
        // Given
        const campaign = {
          campaignParticipation: {
            id: 8654,
            isShared: false,
            save: sinon.stub().rejects(),
            set: sinon.stub().resolves(),
            rollbackAttributes: sinon.stub(),
            campaignParticipationResult: {
              masteryPercentage: 90,
              totalSkillsCount: 5,
              testedSkillsCount: 3,
              validatedSkillsCount: 3,
              stageCount: 2,
              get: sinon.stub().returns([]),
            },
          },
        };

        this.set('campaign', campaign);
        this.set('assessmentId', 'BADGES123');
        this.set('acquiredBadges', null);

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview
          @model={{campaign}}
          @assessmentId={{assessmentId}}
          @acquiredBadges={{acquiredBadge}}
         />`);

        // Then
        expect(find('.skill-review-share__button')).to.exist;
      });

      it('displays an error message and a resume button', async function() {
        // Given
        const campaign = {
          campaignParticipation: {
            id: 8654,
            isShared: false,
            save: sinon.stub().rejects(),
            set: sinon.stub().resolves(),
            rollbackAttributes: sinon.stub(),
            campaignParticipationResult: {
              masteryPercentage: 90,
              totalSkillsCount: 5,
              testedSkillsCount: 3,
              validatedSkillsCount: 3,
              stageCount: 2,
              get: sinon.stub().returns([]),
            },
          },
        };

        this.set('campaign', campaign);
        this.set('assessmentId', 'BADGES123');
        this.set('acquiredBadges', null);

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview
          @model={{campaign}}
          @assessmentId={{assessmentId}}
          @acquiredBadges={{acquiredBadge}}
         />`);

        await click('.skill-review-share__button');

        // Then
        expect(find('.skill-review-share-error__message')).to.exist;
        expect(find('.skill-review-share-error__resume-button')).to.exist;
      });

    });
  });
});
