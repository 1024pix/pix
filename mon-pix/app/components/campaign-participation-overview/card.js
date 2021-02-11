import Component from '@glimmer/component';

const INFO_BY_STATUSES = {
  completed: {
    tagText: 'pages.campaign-participation-overview.card.tag.completed',
    tagColor: 'yellow-light',
    actionText: 'pages.campaign-participation-overview.card.send',
    actionClass: 'button button--link button--yellow',
    dateText: 'pages.campaign-participation-overview.card.started-at',
  },
  started: {
    tagText: 'pages.campaign-participation-overview.card.tag.started',
    tagColor: 'green-light',
    actionText: 'pages.campaign-participation-overview.card.resume',
    actionClass: 'button button--link',
    dateText: 'pages.campaign-participation-overview.card.started-at',
  },
  finished: {
    tagText: 'pages.campaign-participation-overview.card.tag.finished',
    tagColor: 'grey-light',
    actionText: 'pages.campaign-participation-overview.card.see-more',
    actionClass: 'link campaign-participation-overview-card-content__see-more',
    dateText: 'pages.campaign-participation-overview.card.finished-at',
  },
  archived: {
    tagText: 'pages.campaign-participation-overview.card.tag.archived',
    tagColor: 'grey-light',
    dateText: 'pages.campaign-participation-overview.card.started-at',
  },
};

export default class Card extends Component {
  get cardInfo() {
    const status = this.args.model.status;
    const infos = INFO_BY_STATUSES[status];
    const masteryPercentage = this.args.model.masteryPercentage;
    infos.hasMasteryPercentage = ![null, undefined].includes(masteryPercentage);
    infos.masteryPercentage = masteryPercentage;
    return infos;
  }
}
