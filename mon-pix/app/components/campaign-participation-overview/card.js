import Component from '@glimmer/component';

const STATUSES = {
  completed: {
    tagText: 'pages.campaign-participation-overview.card.tag.completed',
    tagColor: 'yellow-light',
    actionText: 'pages.campaign-participation-overview.card.send',
    actionClass: 'button--yellow',
    dateText: 'pages.campaign-participation-overview.card.started-at',
  },
  started: {
    tagText: 'pages.campaign-participation-overview.card.tag.started',
    tagColor: 'green-light',
    actionText: 'pages.campaign-participation-overview.card.resume',
    actionClass: '',
    dateText: 'pages.campaign-participation-overview.card.started-at',
  },
  finished: {
    tagText: 'pages.campaign-participation-overview.card.tag.finished',
    tagColor: 'grey-light',
    actionText: 'pages.campaign-participation-overview.card.see-more',
    actionClass: '',
    dateText: 'pages.campaign-participation-overview.card.finished-at',
  },
};

export default class Card extends Component {
  get status() {
    const currentState = this.args.model.get('assessmentState');
    const isShared = this.args.model.get('isShared');

    if (isShared) return STATUSES.finished;

    return STATUSES[currentState];
  }

  get date() {
    const isShared = this.args.model.get('isShared');

    if (isShared) return this.args.model.get('sharedAt');

    return this.args.model.get('createdAt');

  }
}
