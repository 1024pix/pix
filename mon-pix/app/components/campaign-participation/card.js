import Component from '@glimmer/component';

const STATUSES = {
  completed: {
    tagText: 'pages.campaign-participation.card.tag.completed',
    tagColor: 'yellow-light',
    actionText: 'pages.campaign-participation.card.send',
    actionClass: 'button--yellow',
  },
  started: {
    tagText: 'pages.campaign-participation.card.tag.started',
    tagColor: 'green-light',
    actionText: 'pages.campaign-participation.card.resume',
    actionClass: '',
  },
};

export default class Card extends Component {
  get status() {
    const currentState = this.args.model.get('assessment.state');
    return STATUSES[currentState];
  }

  get campaignCode() {
    return this.args.model.get('campaign.code');
  }
}
