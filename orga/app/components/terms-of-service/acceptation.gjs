import { PixBlock, PixButton, PixButtonLink, PixIcon } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class Acceptation extends Component {
  @service url;

  get legalDocumentUrl() {
    const { legalDocumentPath } = this.args;
    return this.url.getLegalDocumentUrl(legalDocumentPath);
  }

  get isUpdateRequested() {
    return this.args.legalDocumentStatus === 'update-requested';
  }

  <template>
    <PixBlock class="terms-of-service-acceptation" @variant="orga">
      {{#if this.isUpdateRequested}}
        <h1 class="pix-title-m">{{t "components.terms-of-service.title.update-requested"}}</h1>
        <p class="pix-body-m">{{t "components.terms-of-service.message.update-requested"}}</p>
      {{else}}
        <h1 class="pix-title-m">{{t "components.terms-of-service.title.requested"}}</h1>
        <p class="pix-body-m">{{t "components.terms-of-service.message.requested"}}</p>
      {{/if}}

      <div class="terms-of-service-acceptation__illustration">
        <img src="{{this.rootURL}}/images/terms-of-service.svg" alt="" role="none" />
        <a
          href={{this.legalDocumentUrl}}
          target="_blank"
          rel="noopener noreferrer"
          class="terms-of-service-acceptation__link"
        >
          {{t "components.terms-of-service.actions.document-link"}}
          <PixIcon @name="openNew" />
        </a>
      </div>

      <div class="terms-of-service-acceptation__actions">
        <PixButtonLink @route="logout" @variant="secondary" @size="large">
          {{t "components.terms-of-service.actions.reject"}}
        </PixButtonLink>
        <PixButton
          @type="submit"
          @triggerAction={{@onSubmit}}
          @size="large"
          class="terms-of-service-acceptation__accept-action"
        >
          {{t "components.terms-of-service.actions.accept"}}
        </PixButton>
      </div>
    </PixBlock>
  </template>
}
