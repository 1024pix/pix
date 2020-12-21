import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import times from 'lodash/times';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | CampaignParticipation | Grid', function() {
  let component;

  setupTest();

  beforeEach(function() {
    // given
    component = createGlimmerComponent('component:campaign-participation/grid');
  });

  describe('#filteredCampaignParticipations', function() {
    it('should filter campaign of type profile collection', function() {
      // given
      const campaignParticipations = [
        EmberObject.create({
          createdAt: '2020-12-10T15:16:20.109Z',
          campaign: { title: 'My campaign 1', isTypeAssessment: true },
        }),
        EmberObject.create({
          createdAt: '2020-12-10T15:16:20.109Z',
          campaign: { title: 'My campaign 2', isTypeProfilesCollection: true },
        }),
        EmberObject.create({
          createdAt: '2020-12-10T15:16:20.109Z',
          campaign: { title: 'My campaign 3', isTypeAssessment: true },
        }),
      ];
      component.args.model = campaignParticipations;

      // when
      const result = component.filteredCampaignParticipations;

      // then
      expect(result).to.deep.equal([
        campaignParticipations[0],
        campaignParticipations[2],
      ]);
    });

    it('should filter already shared campaign participation', async function() {
      // given
      const campaignParticipations = [
        EmberObject.create({
          createdAt: '2020-12-10T15:16:20.109Z',
          isShared: true,
          campaign: { title: 'My campaign 1', isTypeAssessment: true },
        }),
        EmberObject.create({
          createdAt: '2020-12-10T15:16:20.109Z',
          isShared: false,
          campaign: { title: 'My campaign 2', isTypeAssessment: true },
        }),
        EmberObject.create({
          createdAt: '2020-12-10T15:16:20.109Z',
          isShared: true,
          campaign: { title: 'My campaign 3', isTypeAssessment: true },
        }),
      ];
      component.args.model = campaignParticipations;

      // when
      const result = component.filteredCampaignParticipations;

      // then
      expect(result).to.deep.equal([
        campaignParticipations[1],
      ]);
    });

    it('should filter campaign participations with different conditions', async function() {
      // given
      const campaignParticipations = [
        EmberObject.create({
          createdAt: '2020-12-10T15:16:20.109Z',
          isShared: true,
          campaign: { title: 'My campaign 1', isTypeAssessment: true },
        }),
        EmberObject.create({
          createdAt: '2020-12-10T15:16:20.109Z',
          isShared: false,
          campaign: { title: 'My campaign 2', isTypeAssessment: true },
        }),
        EmberObject.create({
          createdAt: '2020-12-10T15:16:20.109Z',
          isShared: true,
          campaign: { title: 'My campaign 3', isTypeProfilesCollection: true },
        }),
        EmberObject.create({
          createdAt: '2020-12-10T15:16:20.109Z',
          isShared: false,
          campaign: { title: 'My campaign 4', isTypeProfilesCollection: true },
        }),
      ];
      component.args.model = campaignParticipations;

      // when
      const result = component.filteredCampaignParticipations;

      // then
      expect(result).to.deep.equal([
        campaignParticipations[1],
      ]);
    });

    it('should render up to 9 campaign participation', async function() {
      // given
      const campaignParticipations = times(10, (index) => {
        return EmberObject.create({
          createdAt: '2020-12-10T15:16:20.109Z',
          campaign: { title: `My campaign ${index}`, isTypeAssessment: true },
        });
      });
      component.args.model = campaignParticipations;

      // when
      const result = component.filteredCampaignParticipations;

      // then
      expect(result.length).to.equal(9);
    });
  });
});
