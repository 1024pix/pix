import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

const MAX_COMMENTS_LENGTH = 500;

export default class VersionComment extends Component {
  @service intl;
  @service pixToast;

  @tracked comments = this.args.version.comments ?? '';

  @action
  async saveComments() {
    try {
      this.args.version.comments = this.comments;
      await this.args.version.save();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(
          'components.certification-frameworks.item.framework.version-detail-modal.comment-save-success',
        ),
      });
    } catch {
      this.args.version.rollbackAttributes();
      this.pixToast.sendErrorNotification({
        message: this.intl.t(
          'components.certification-frameworks.item.framework.version-detail-modal.comment-save-error',
        ),
      });
    }
  }

  @action
  onCommentsChange(event) {
    this.comments = event.target.value;
  }

  <template>
    <h2 class="certification-version-detail-modal__subtitle">{{t
        "components.certification-frameworks.item.framework.version-detail-modal.comment"
      }}</h2>
    <PixBlock class="certification-version-detail-modal__comment">
      <PixTextarea
        id="version-comment"
        @value={{this.comments}}
        @maxlength={{MAX_COMMENTS_LENGTH}}
        {{on "input" this.onCommentsChange}}
      />
      <div class="version-comment__actions">
        <PixButton @size="small" @variant="secondary" @triggerAction={{this.saveComments}}>
          {{t "common.actions.save"}}
        </PixButton>
      </div>
    </PixBlock>
  </template>
}
