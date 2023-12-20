import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class Details extends Component {
  @tracked isLinkCopied = false;

  constructor() {
    super(...arguments);
  }
  get formattedCreatedAt() {
    const createdAtDate = new Date(this.args.autonomousCourse.createdAt);

    const day = createdAtDate.getDate().toString().padStart(2, '0');
    const month = (createdAtDate.getMonth() + 1).toString().padStart(2, '0');
    const year = createdAtDate.getFullYear();

    return `${day}/${month}/${year}`;
  }

  get campaignLink() {
    const updatedOrigin = window.origin.replace('admin', 'app');
    return `${updatedOrigin}/campagnes/${this.args.autonomousCourse.code}`;
  }

  @action
  copyCampaignLink() {
    this.setIsLinkCopied(true);

    new Promise((resolve) => {
      navigator.clipboard.writeText(this.campaignLink).then(() => {
        resolve();
      });
    }).then(() => {
      setTimeout(() => {
        this.setIsLinkCopied(false);
      }, 2000);
    });
  }

  @action
  setIsLinkCopied(value) {
    this.isLinkCopied = value;
  }
}
