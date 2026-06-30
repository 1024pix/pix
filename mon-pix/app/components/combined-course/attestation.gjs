import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import { REWARD_STATUSES } from 'mon-pix/models/combined-course-reward';

export default class Attestation extends Component {
  @service session;
  @service fileSaver;
  @service intl;

  @action
  async onClick() {
    const { access_token: token, user_id: userId } = this.session.data.authenticated;
    const url = `/api/users/${userId}/attestations/${this.args.attestation.data.key}`;
    const fileName = this.args.attestation.templateName;
    await this.fileSaver.save({ url, token, fileName });
  }

  get imageDetails() {
    return {
      class: 'attestation__picto--' + this.args.attestation.computedStatus,
      alt: 'attestation-image-' + this.args.attestation.computedStatus,
    };
  }

  get mainContentDetails() {
    const status = this.args.attestation.computedStatus;
    return {
      information: this.intl.t(`pages.combined-courses.rewards.${status}.details.title`),
      text:
        status === REWARD_STATUSES.OBTAINED
          ? this.intl.t(`pages.combined-courses.rewards.${status}.details.text`)
          : null,
    };
  }

  get statusTag() {
    let variant;
    if (this.args.attestation.computedStatus === REWARD_STATUSES.OBTAINED) {
      variant = 'green';
    } else if (this.args.attestation.computedStatus === REWARD_STATUSES.NOT_OBTAINED) {
      variant = 'error';
    } else {
      variant = 'grey';
    }

    return {
      text: this.intl.t(`pages.combined-courses.rewards.${this.args.attestation.computedStatus}.status`),
      variant,
    };
  }

  <template>
    <article class="attestation">
      <img
        src="https://assets.pix.org/combined-courses/attestation-image.svg"
        class={{this.imageDetails.class}}
        alt={{this.imageDetails.alt}}
      />
      <div>
        <AttestationDetails
          class="attestation__details"
          @label={{@attestation.label}}
          @variant={{this.statusTag.variant}}
          @status={{this.statusTag.text}}
          @information={{this.mainContentDetails.information}}
          @text={{this.mainContentDetails.text}}
        />

        {{#if (eq @attestation.computedStatus "obtained")}}
          <PixButton class="attestation__download-button" @variant="secondary" @triggerAction={{this.onClick}}>
            {{t "pages.combined-courses.rewards.obtained.link"}}
          </PixButton>
        {{/if}}
      </div>
    </article>
  </template>
}

const AttestationDetails = <template>
  <section class="attestation-details" ...attributes>
    <h2 class="attestation-details__title">
      {{t "pages.combined-courses.rewards.title"}}
      {{@label}}
      <PixTag @color={{@variant}} class="attestation-details__tag">{{@status}}</PixTag>
    </h2>

    <p>
      <em class="attestation-details__information">{{@information}}</em>
      {{#if @text}}
        <br />
        {{@text}}
      {{/if}}
    </p>
  </section>
</template>;
