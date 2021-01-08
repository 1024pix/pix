import Component from '@glimmer/component';

const STATUSES = {
  completed: {
    tagText: 'pages.campaign-participation-overview.card.tag.completed',
    tagColor: 'yellow-light',
    actionText: 'pages.campaign-participation-overview.card.send',
    actionClass: 'button--yellow',
  },
  started: {
    tagText: 'pages.campaign-participation-overview.card.tag.started',
    tagColor: 'green-light',
    actionText: 'pages.campaign-participation-overview.card.resume',
    actionClass: '',
  },
};

export default class Card extends Component {
  get status() {
    const currentState = this.args.model.get('assessmentState');
    return STATUSES[currentState];
  }
}
