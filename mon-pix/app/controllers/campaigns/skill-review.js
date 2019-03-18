import Controller from '@ember/controller';
import { computed } from '@ember/object';
import domainColors from 'mon-pix/static-data/domain-colors';

export default Controller.extend({

  showButtonToShareResult: true,
  domainColors: domainColors.colors,

  competences: [{
    domainId: '1',
    name: 'Mener une recherche',
    result: '25',
    total: '50'
  }, {
    domainId: '2',
    name: 'Gérer des données',
    result: '13',
    total: '90'
  }, {
    domainId: '3',
    name: 'Interagir',
    result: '100',
    total: '45'
  }],

  init() {
    this._super(...arguments);
    this.competences.map((competence) => {
      const foundDomain = this.domainColors.find((colors) => colors.domain === competence.domainId);
      competence.domainColor = foundDomain.color;
    });
  },

  actions: {
    shareCampaignParticipation() {
      const campaignParticipation = this.get('model.campaignParticipation');
      campaignParticipation.set('isShared', true);
      campaignParticipation.save()
        .then(function () {
          this.set('showButtonToShareResult', false);
        }.bind(this));

    },
    hideShareButton() {
      this.set('showButtonToShareResult', false);
    }
  }
});
