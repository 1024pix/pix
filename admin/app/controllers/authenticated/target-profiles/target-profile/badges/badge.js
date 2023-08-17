import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class BadgeController extends Controller {
  @service store;

  @action
  async updateBadge(badgeDTO) {
    const badge = this.model.badge;
    badge.title = badgeDTO.title;
    badge.key = badgeDTO.key;
    badge.message = badgeDTO.message;
    badge.altMessage = badgeDTO.altMessage;
    badge.isCertifiable = badgeDTO.isCertifiable;
    badge.isAlwaysVisible = badgeDTO.isAlwaysVisible;
    badge.imageUrl = badgeDTO.imageUrl;
    await badge.save();
    await this.model.targetProfile.reload();
  }
}
