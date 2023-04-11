import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import createGlimmerComponent from '../../../../../helpers/create-glimmer-component';
import Service from '@ember/service';

module('Unit | component | Campaigns | Evaluation | Skill Review', function (hooks) {
  setupTest(hooks);

  let component, adapter, possibleBadgesCombinations;

  hooks.beforeEach(function () {
    possibleBadgesCombinations = [
      { id: 30, isAcquired: true, isCertifiable: true, isValid: true, isAlwaysVisible: true },
      { id: 31, isAcquired: true, isCertifiable: true, isValid: true, isAlwaysVisible: false },
      { id: 32, isAcquired: true, isCertifiable: true, isValid: false, isAlwaysVisible: true },
      { id: 33, isAcquired: true, isCertifiable: true, isValid: false, isAlwaysVisible: false },
      { id: 34, isAcquired: true, isCertifiable: false, isValid: true, isAlwaysVisible: true },
      { id: 35, isAcquired: true, isCertifiable: false, isValid: true, isAlwaysVisible: false },
      { id: 36, isAcquired: true, isCertifiable: false, isValid: false, isAlwaysVisible: true },
      { id: 37, isAcquired: true, isCertifiable: false, isValid: false, isAlwaysVisible: false },
      { id: 38, isAcquired: false, isCertifiable: true, isValid: true, isAlwaysVisible: true },
      { id: 39, isAcquired: false, isCertifiable: true, isValid: true, isAlwaysVisible: false },
      { id: 40, isAcquired: false, isCertifiable: true, isValid: false, isAlwaysVisible: true },
      { id: 41, isAcquired: false, isCertifiable: true, isValid: false, isAlwaysVisible: false },
      { id: 42, isAcquired: false, isCertifiable: false, isValid: true, isAlwaysVisible: true },
      { id: 43, isAcquired: false, isCertifiable: false, isValid: true, isAlwaysVisible: false },
      { id: 44, isAcquired: false, isCertifiable: false, isValid: false, isAlwaysVisible: true },
      { id: 45, isAcquired: false, isCertifiable: false, isValid: false, isAlwaysVisible: false },
    ];

    const model = {
      campaign: EmberObject.create(),
      campaignParticipationResult: EmberObject.create({ id: 12345 }),
    };

    component = createGlimmerComponent('component:routes/campaigns/assessment/skill-review', {
      model,
    });

    const store = this.owner.lookup('service:store');
    adapter = store.adapterFor('campaign-participation-result');
    sinon.stub(adapter, 'share').resolves();
    sinon.stub(adapter, 'beginImprovement').resolves();

    component.router.transitionTo = sinon.stub();
  });

  module('#shareCampaignParticipation', function () {
    test('should call adapter', async function (assert) {
      // when
      await component.actions.shareCampaignParticipation.call(component);

      // then
      sinon.assert.calledWithExactly(adapter.share, 12345);
      assert.ok(true);
    });

    module('before share', function () {
      test('isShareButtonClicked should be false', async function (assert) {
        // then
        assert.false(component.isShareButtonClicked);
      });
    });

    module('when share is not yet effective but button is pressed', function () {
      test('should set isShareButtonClicked to true', async function (assert) {
        // when
        await component.actions.shareCampaignParticipation.call(component);

        // then
        assert.true(component.isShareButtonClicked);
      });
    });

    module('when share is effective', function () {
      test('should set isShared to true', async function (assert) {
        // given
        adapter.share.resolves();

        // when
        await component.actions.shareCampaignParticipation.call(component);

        // then
        assert.true(component.args.model.campaignParticipationResult.isShared);
      });
    });

    module('when an error occurred during share', function () {
      test('should keep isShared to false', async function (assert) {
        component.args.model.campaignParticipationResult.isShared = false;
        adapter.share.rejects();

        await component.actions.shareCampaignParticipation.call(component);

        assert.false(component.args.model.campaignParticipationResult.isShared);
      });

      test('should display not-finished-yet message if status is 409', async function (assert) {
        adapter.share.rejects({ errors: [{ status: '409' }] });

        await component.actions.shareCampaignParticipation.call(component);

        assert.true(component.showNotFinishedYetMessage);
      });

      test('should display global error message if status is not 409', async function (assert) {
        adapter.share.rejects({ errors: [{ status: '412' }] });

        await component.actions.shareCampaignParticipation.call(component);

        assert.true(component.showGlobalErrorMessage);
      });
    });
  });

  module('#improve', function () {
    test('should save the campaignParticipation to start the improvement', async function (assert) {
      // when
      await component.actions.improve.call(component);

      // then
      sinon.assert.calledWithExactly(adapter.beginImprovement, 12345);
      assert.ok(true);
    });

    test('should redirect to campaigns.entry-point', async function (assert) {
      // when
      await component.actions.improve.call(component);

      // then
      sinon.assert.calledWith(component.router.transitionTo, 'campaigns.entry-point');
      assert.ok(true);
    });
  });

  module('#showCleaCompetences', function () {
    test('should showCleaCompetences when campaignParticipationResult has a clea badge', function (assert) {
      // given
      const cleaBadge = { id: 111 };
      component.args.model.campaignParticipationResult.cleaBadge = cleaBadge;

      // when
      const shouldShowCleaCompetences = component.showCleaCompetences;

      // then
      assert.true(shouldShowCleaCompetences);
    });

    test('should not show clea competence when there is no cleaBadge', function (assert) {
      // given
      component.args.model.campaignParticipationResult.cleaBadge = undefined;

      // when
      const shouldShowCleaCompetences = component.showCleaCompetences;

      // then
      assert.false(shouldShowCleaCompetences);
    });
  });

  module('#showNotCertifiableBadges', function () {
    test('should show not certifiable badges when acquired', function (assert) {
      // given
      const badges = [{ id: 33, isAcquired: true, isCertifiable: false }];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showNotCertifiableBadges;

      // then
      assert.true(shouldShowBadges);
    });

    test('should not show certifiable badges when acquired', function (assert) {
      // given
      const badges = [{ id: 33, isAcquired: true, isCertifiable: true }];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showNotCertifiableBadges;

      // then
      assert.false(shouldShowBadges);
    });

    test('should not show badges when not acquired', function (assert) {
      // given
      const badges = [{ id: 33, isAcquired: false }];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showNotCertifiableBadges;

      // then
      assert.false(shouldShowBadges);
    });

    test('should not show badges when none', function (assert) {
      // given
      const badges = [];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showNotCertifiableBadges;

      // then
      assert.false(shouldShowBadges);
    });
  });

  module('#showCertifiableBadges', function () {
    test('should show certifiable badges when acquired', function (assert) {
      // given
      const badges = [{ id: 33, isAcquired: true, isCertifiable: true }];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showCertifiableBadges;

      // then
      assert.true(shouldShowBadges);
    });

    test('should not show not certifiable badges when acquired', function (assert) {
      // given
      const badges = [{ id: 33, isAcquired: true, isCertifiable: false }];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showCertifiableBadges;

      // then
      assert.false(shouldShowBadges);
    });

    test('should not show badges when not acquired', function (assert) {
      // given
      const badges = [{ id: 33, isAcquired: false }];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showCertifiableBadges;

      // then
      assert.false(shouldShowBadges);
    });

    test('should not show badges when none', function (assert) {
      // given
      const badges = [];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showCertifiableBadges;

      // then
      assert.false(shouldShowBadges);
    });
  });

  module('#showValidBadges', function () {
    test('should show badges when valid', function (assert) {
      // given
      const badges = [{ id: 33, isAcquired: true, isCertifiable: true, isValid: true }];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showValidBadges;

      // then
      assert.true(shouldShowBadges);
    });

    test('should not show not badges when not valid', function (assert) {
      // given
      const badges = [{ id: 33, isAcquired: true, isCertifiable: true, isValid: false }];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showValidBadges;

      // then
      assert.false(shouldShowBadges);
    });

    test('should not show badges when none', function (assert) {
      // given
      const badges = [];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showValidBadges;

      // then
      assert.false(shouldShowBadges);
    });
  });

  module('#acquiredNotCertifiableBadges', function () {
    test('should only return acquired and not certifiable badges', function (assert) {
      // given
      component.args.model.campaignParticipationResult.campaignParticipationBadges = possibleBadgesCombinations;

      // when
      const acquiredBadges = component.acquiredNotCertifiableBadges;

      // then
      assert.deepEqual(acquiredBadges, [
        { id: 34, isAcquired: true, isCertifiable: false, isValid: true, isAlwaysVisible: true },
        { id: 35, isAcquired: true, isCertifiable: false, isValid: true, isAlwaysVisible: false },
        { id: 36, isAcquired: true, isCertifiable: false, isValid: false, isAlwaysVisible: true },
        { id: 37, isAcquired: true, isCertifiable: false, isValid: false, isAlwaysVisible: false },
      ]);
    });
  });

  module('#validBadges', function () {
    test('should only return valid badges', function (assert) {
      // given
      component.args.model.campaignParticipationResult.campaignParticipationBadges = possibleBadgesCombinations;

      // when
      const acquiredBadges = component.validBadges;

      // then
      assert.deepEqual(acquiredBadges, [
        { id: 30, isAcquired: true, isCertifiable: true, isValid: true, isAlwaysVisible: true },
        { id: 31, isAcquired: true, isCertifiable: true, isValid: true, isAlwaysVisible: false },
      ]);
    });
  });

  module('#invalidBadges', function () {
    test('should only return invalid badges', function (assert) {
      // given
      component.args.model.campaignParticipationResult.campaignParticipationBadges = possibleBadgesCombinations;

      // when
      const acquiredBadges = component.invalidBadges;

      // then
      assert.deepEqual(acquiredBadges, [
        { id: 32, isAcquired: true, isCertifiable: true, isValid: false, isAlwaysVisible: true },
        { id: 33, isAcquired: true, isCertifiable: true, isValid: false, isAlwaysVisible: false },
        { id: 38, isAcquired: false, isCertifiable: true, isValid: true, isAlwaysVisible: true },
        { id: 40, isAcquired: false, isCertifiable: true, isValid: false, isAlwaysVisible: true },
      ]);
    });
  });

  module('#certifiableBadgesOrderedByValidity', function () {
    test('should return certifiable badges ordered by validity status', function (assert) {
      // given
      component.args.model.campaignParticipationResult.campaignParticipationBadges = possibleBadgesCombinations;

      // when
      const acquiredBadges = component.certifiableBadgesOrderedByValidity;

      // then
      assert.deepEqual(acquiredBadges, [
        { id: 30, isAcquired: true, isCertifiable: true, isValid: true, isAlwaysVisible: true },
        { id: 31, isAcquired: true, isCertifiable: true, isValid: true, isAlwaysVisible: false },
        { id: 32, isAcquired: true, isCertifiable: true, isValid: false, isAlwaysVisible: true },
        { id: 33, isAcquired: true, isCertifiable: true, isValid: false, isAlwaysVisible: false },
        { id: 38, isAcquired: false, isCertifiable: true, isValid: true, isAlwaysVisible: true },
        { id: 40, isAcquired: false, isCertifiable: true, isValid: false, isAlwaysVisible: true },
      ]);
    });
  });

  module('#showOrganizationMessage', function () {
    test('should return true when the campaign has a customResultPageText', function (assert) {
      // given
      component.args.model.campaign.customResultPageText =
        'Afin de vous faire progresser, nous vous proposons des documents pour aller plus loin dans les compétences que vous venez de tester.';

      // when
      const result = component.showOrganizationMessage;

      // then
      assert.true(result);
    });

    test('should return false when the campaign has no customResultPageText ', function (assert) {
      // given
      component.args.model.campaign.customResultPageText = null;

      // when
      const result = component.showOrganizationMessage;

      // then
      assert.false(result);
    });
  });

  module('#showOrganizationButton', function () {
    test('should return true when the organization has a customResultPageButtonText and a customResultPageButtonUrl', async function (assert) {
      // given
      component.args.model.campaign.customResultPageButtonText = 'Go to the next step';
      component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net';

      // when
      const result = await component.showOrganizationButton;

      // then
      assert.true(result);
    });

    test('should return false when the organization has no a customResultPageButtonText ', function (assert) {
      // given
      component.args.model.campaign.customResultPageButtonText = null;
      component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net';

      // when
      const result = component.showOrganizationButton;

      // then
      assert.false(result);
    });

    test('should return false when the organization has noa customResultPageButtonUrl', function (assert) {
      // given
      component.args.model.campaign.customResultPageButtonText = 'Next step';
      component.args.model.campaign.customResultPageButtonUrl = null;

      // when
      const result = component.showOrganizationButton;

      // then
      assert.false(result);
    });
  });

  module('#customButtonUrl', function () {
    module('when there is a customResultPageButtonUrl', function () {
      module('when the participant has finished a campaign with stages', function () {
        test('should add the stage to the url ', function (assert) {
          // given
          const reachedStage = { id: 123, threshold: 6, get: sinon.stub() };
          reachedStage.get.withArgs('threshold').returns(6);
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/resultats';
          component.args.model.campaignParticipationResult.reachedStage = reachedStage;

          // when
          const url = component.customButtonUrl;

          // then
          assert.strictEqual(url, 'http://www.my-url.net/resultats?stage=6');
        });
      });

      module('when the participant has a mastery percentage', function () {
        test('should add the masteryPercentage to the url', function (assert) {
          // given
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/resultats';
          component.args.model.campaignParticipationResult.masteryRate = '0.56';

          // when
          const url = component.customButtonUrl;

          // then
          assert.strictEqual(url, 'http://www.my-url.net/resultats?masteryPercentage=56');
        });
      });

      module('when the participant has a mastery percentage equals to 0', function () {
        test('should add the masteryPercentage to the url', function (assert) {
          // given
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/resultats';
          component.args.model.campaignParticipationResult.masteryRate = '0.0';

          // when
          const url = component.customButtonUrl;

          // then
          assert.strictEqual(url, 'http://www.my-url.net/resultats?masteryPercentage=0');
        });
      });

      module('when the participant has a participantExternalId', function () {
        test('should add the externalId to the url', function (assert) {
          // given
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/resultats';
          component.args.model.campaignParticipationResult.participantExternalId = '1234F56';

          // when
          const url = component.customButtonUrl;

          // then
          assert.strictEqual(url, 'http://www.my-url.net/resultats?externalId=1234F56');
        });
      });

      module('when the participant has a participantExternalId, a mastery percentage and stages ', function () {
        test('should add all params to the url', function (assert) {
          // given
          const reachedStage = { id: 123, threshold: 6, get: sinon.stub() };
          reachedStage.get.withArgs('threshold').returns(6);
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/resultats';
          component.args.model.campaignParticipationResult.participantExternalId = '1234F56';
          component.args.model.campaignParticipationResult.masteryRate = '0.56';
          component.args.model.campaignParticipationResult.reachedStage = reachedStage;

          // when
          const url = component.customButtonUrl;

          // then
          assert.strictEqual(url, 'http://www.my-url.net/resultats?masteryPercentage=56&externalId=1234F56&stage=6');
        });
      });

      module('when the url already has query params', function () {
        test('should add the new parameters to the other query params', function (assert) {
          // given
          const reachedStage = { id: 123, threshold: 6, get: sinon.stub() };
          reachedStage.get.withArgs('threshold').returns(6);
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/resultats?foo=bar';
          component.args.model.campaignParticipationResult.reachedStage = reachedStage;
          component.args.model.campaignParticipationResult.participantExternalId = '1234F56';
          component.args.model.campaignParticipationResult.masteryRate = '0.56';

          // when
          const url = component.customButtonUrl;

          // then
          assert.strictEqual(
            url,
            'http://www.my-url.net/resultats?foo=bar&masteryPercentage=56&externalId=1234F56&stage=6'
          );
        });
      });

      module('when the url has an ancor', function () {
        test('should add the new parameters before the ancor', function (assert) {
          // given
          const reachedStage = { id: 123, threshold: 6, get: sinon.stub() };
          reachedStage.get.withArgs('threshold').returns(6);
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/#page1';
          component.args.model.campaignParticipationResult.reachedStage = reachedStage;
          component.args.model.campaignParticipationResult.participantExternalId = '1234F56';
          component.args.model.campaignParticipationResult.masteryRate = '0.56';

          // when
          const url = component.customButtonUrl;

          // then
          assert.strictEqual(url, 'http://www.my-url.net/?masteryPercentage=56&externalId=1234F56&stage=6#page1');
        });
      });

      module('when there is no params', function () {
        test('should return the url of the custom button', function (assert) {
          // given
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net';
          component.args.model.campaignParticipationResult.reachedStage = null;

          // when
          const url = component.customButtonUrl;

          // then
          assert.strictEqual(url, 'http://www.my-url.net/');
        });
      });
    });

    module('when there is no customResultPageButtonUrl', function () {
      test('should return nothing', function (assert) {
        // given
        component.args.model.campaign.customResultPageButtonUrl = null;
        component.args.model.campaignParticipationResult.reachedStage = 80;

        // when
        const url = component.customButtonUrl;

        // then
        assert.strictEqual(url, null);
      });
    });
  });

  module('#customButtonText', function () {
    test('should return the text of the custom button', function (assert) {
      // given
      component.args.model.campaign.customResultPageButtonText = 'Next step';

      // when
      const result = component.customButtonText;

      // then
      assert.strictEqual(result, 'Next step');
    });
  });

  module('#isShared', function () {
    test('should return the value of isShared', function (assert) {
      // given
      component.args.model.campaignParticipationResult.isShared = true;

      // when
      const result = component.isShared;

      // then
      assert.true(result);
    });
  });

  module('#displayPixLink', function () {
    test('should return false when there are customResultPageButtonText and customResultPageButtonUrl', function (assert) {
      // given
      component.args.model.campaign.customResultPageButtonText = 'Next step';
      component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net';
      // when
      const result = component.displayPixLink;

      // then
      assert.false(result);
    });

    test('should return true when customResultPageButtonText or customResultPageButtonUrl is empty', function (assert) {
      // given
      component.args.model.campaign.customResultPageButtonText = null;
      component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net';
      // when
      const result = component.displayPixLink;

      // then
      assert.true(result);
    });

    test('should return true when customResultPageButtonText and customResultPageButtonUrl are empty', function (assert) {
      // given
      component.args.model.campaign.customResultPageButtonText = null;
      component.args.model.campaign.customResultPageButtonUrl = null;
      // when
      const result = component.displayPixLink;

      // then
      assert.true(result);
    });
  });

  module('#showImproveButton', function () {
    test('should return false when canImprove is false', function (assert) {
      // given
      component.args.model.campaignParticipationResult.canImprove = false;
      component.isShareButtonClicked = false;
      // when
      const result = component.showImproveButton;

      // then
      assert.false(result);
    });

    test('should return false when isShareButtonClicked is true', function (assert) {
      // given
      component.args.model.campaignParticipationResult.canImprove = true;
      component.isShareButtonClicked = true;
      // when
      const result = component.showImproveButton;

      // then
      assert.false(result);
    });

    test('should return true when canImprove is true and isShareButtonClicked is false', function (assert) {
      // given
      component.args.model.campaignParticipationResult.canImprove = true;
      component.isShareButtonClicked = false;
      // when
      const result = component.showImproveButton;

      // then
      assert.true(result);
    });
  });

  module('#competenceResultsGroupedByAreas', function () {
    test('should return a competence results object with area keys', function (assert) {
      // given
      component.args.model.campaignParticipationResult.competenceResults = [
        {
          areaColor: 'areaColor1',
          areaTitle: 'area1',
          name: 'competence1',
          masteryRate: '33',
          reachedStage: 1,
        },
        {
          areaColor: 'areaColor1',
          areaTitle: 'area1',
          name: 'competence2',
          masteryRate: '50',
          reachedStage: 2,
        },
        {
          areaColor: 'areaColor2',
          areaTitle: 'area2',
          name: 'competence3',
          masteryRate: '60',
          reachedStage: 3,
        },
      ];

      // when
      const competenceResults = component.competenceResultsGroupedByAreas;

      // then
      assert.deepEqual(competenceResults, {
        area1: {
          areaColor: 'areaColor1',
          areaTitle: 'area1',
          competences: [
            {
              masteryRate: '33',
              name: 'competence1',
              reachedStage: 1,
            },
            {
              masteryRate: '50',
              name: 'competence2',
              reachedStage: 2,
            },
          ],
        },
        area2: {
          areaColor: 'areaColor2',
          areaTitle: 'area2',
          competences: [
            {
              masteryRate: '60',
              name: 'competence3',
              reachedStage: 3,
            },
          ],
        },
      });
    });
  });

  module('#redirectToSignupIfUserIsAnonymous', function () {
    test('should redirect to sign up page on click when user is anonymous', async function (assert) {
      // given
      const event = {
        preventDefault: () => {},
      };
      const session = this.owner.lookup('service:session');

      class currentUser extends Service {
        user = { isAnonymous: true };
      }

      this.owner.register('service:currentUser', currentUser);

      session.invalidate = sinon.stub();

      // when
      await component.actions.redirectToSignupIfUserIsAnonymous.call(component, event);

      // then
      sinon.assert.called(session.invalidate);
      sinon.assert.calledWith(component.router.transitionTo, 'inscription');
      assert.ok(true);
    });

    test('should redirect to home page when user is not anonymous', async function (assert) {
      // given
      const event = {
        preventDefault: () => {},
      };

      class currentUser extends Service {
        user = { isAnonymous: false };
      }

      this.owner.register('service:currentUser', currentUser);

      // when
      await component.actions.redirectToSignupIfUserIsAnonymous.call(component, event);

      // then
      sinon.assert.calledWith(component.router.transitionTo, 'authenticated');
      assert.ok(true);
    });

    test('prevents default behaviour', async function (assert) {
      // given
      const event = { preventDefault: sinon.stub() };

      class currentUser extends Service {
        user = { isAnonymous: false };
      }

      this.owner.register('service:currentUser', currentUser);

      // when
      await component.actions.redirectToSignupIfUserIsAnonymous.call(component, event);

      // then
      sinon.assert.called(event.preventDefault);
      assert.ok(true);
    });
  });
});
