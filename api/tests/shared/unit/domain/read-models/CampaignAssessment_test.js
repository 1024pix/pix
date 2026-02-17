import { CampaignTypes } from '../../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { CampaignAssessment } from '../../../../../src/shared/domain/read-models/CampaignAssessment.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Domain | Read-Models | CampaignAssessment', function () {
  describe('#constructor', function () {
    it('should be of type CAMPAIGN', function () {
      expect(new CampaignAssessment({}).type).to.equal(Assessment.types.CAMPAIGN);
    });

    describe('globalProgression', function () {
      it('should defined globalProgression', function () {
        expect(new CampaignAssessment({}, 0.6).globalProgression).to.equal(0.6);
      });

      it('should set globalProgression to null by default', function () {
        expect(new CampaignAssessment({}).globalProgression).null;
      });
    });

    it('should have method of type SMART_RANDOM', function () {
      expect(new CampaignAssessment({}).method).to.equal(Assessment.methods.SMART_RANDOM);
    });

    describe('when campaign has type ASSESSMENT', function () {
      let assessment;
      before(function () {
        const campaign = domainBuilder.buildCampaign({ title: 'Ma Campagne', type: CampaignTypes.ASSESSMENT });
        assessment = new CampaignAssessment({ campaign });
      });

      it('should init showChallengeStepper', function () {
        expect(assessment.showChallengeStepper).to.equal(true);
      });

      it('should init showGlobalProgression', function () {
        expect(assessment.showGlobalProgression).to.equal(false);
      });

      it('should init hasCheckpoints', function () {
        expect(assessment.hasCheckpoints).to.equal(true);
      });

      it('should init showLevelup', function () {
        expect(assessment.showLevelup).to.equal(true);
      });

      it('should init showQuestionCounter', function () {
        expect(assessment.showQuestionCounter).to.equal(true);
      });

      it('should init title', function () {
        expect(assessment.title).to.equal('Ma Campagne');
      });
    });

    describe('when campaign has type EXAM', function () {
      let assessment;
      before(function () {
        const campaign = domainBuilder.buildCampaign({ title: 'Ma Campagne', type: CampaignTypes.EXAM });
        assessment = new CampaignAssessment({ campaign });
      });

      it('should init showChallengeStepper', function () {
        expect(assessment.showChallengeStepper).to.equal(false);
      });

      it('should init showGlobalProgression', function () {
        expect(assessment.showGlobalProgression).to.equal(true);
      });

      it('should init hasCheckpoints', function () {
        expect(assessment.hasCheckpoints).to.equal(false);
      });

      it('should init showLevelup', function () {
        expect(assessment.showLevelup).to.equal(false);
      });

      it('should init showQuestionCounter', function () {
        expect(assessment.showQuestionCounter).to.equal(false);
      });

      it('should init title', function () {
        expect(assessment.title).to.equal('Ma Campagne');
      });
    });

    describe('when campaign is not defined', function () {
      let assessment;
      before(function () {
        assessment = new CampaignAssessment({ campaign: null });
      });

      it('should init showChallengeStepper', function () {
        expect(assessment.showChallengeStepper).to.equal(false);
      });

      it('should init showGlobalProgression', function () {
        expect(assessment.showGlobalProgression).to.equal(false);
      });

      it('should init hasCheckpoints', function () {
        expect(assessment.hasCheckpoints).to.equal(false);
      });

      it('should init showLevelup', function () {
        expect(assessment.showLevelup).to.equal(false);
      });

      it('should init showQuestionCounter', function () {
        expect(assessment.showQuestionCounter).to.equal(false);
      });

      it('should init title', function () {
        expect(assessment.title).to.equal('');
      });
    });
  });
});
