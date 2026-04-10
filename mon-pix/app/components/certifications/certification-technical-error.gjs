import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import CertificationBanner from 'mon-pix/components/certification-banner';

export default class CertificationTechnicalError extends Component {
  @service currentUser;

  <template>
    <CertificationBanner @certificationNumber={{@certificationNumber}} />

    <PixBlock class="certification-technical-error">
      <div class="certification-technical-error__finished-test">
        <div class="certification-technical-error-finished-test__candidate">
          <p class="certification-technical-error-candidate__name">
            <PixIcon @name="userCircle" @plainIcon={{true}} @ariaHidden={{true}} />
            {{this.currentUser.user.fullName}}
          </p>
          <h1 class="certification-technical-error-candidate__title">{{t "pages.certification-technical-error.candidate.title"}}</h1>
          <p class="certification-technical-error-candidate__message">
            {{t "pages.certification-technical-error.candidate.message"}}
          </p>
          <PixButtonLink @route="logout" @variant="primary">
            {{t "pages.certification-technical-error.candidate.disconnect"}}
          </PixButtonLink>
          <p class="certification-technical-error-candidate__disconnect-tip">
            {{t "pages.certification-technical-error.candidate.disconnect-tip"}}
          </p>
        </div>
      </div>

      <div class="certification-technical-error__results">
        {{#if @isToBeCancelled}}
          <h2 class="certification-technical-error-results__disclaimer">
            {{t "pages.certification-technical-error.candidate.cancelled.disclaimer"}}
          </h2>
          <p class="certification-technical-error-results__title">
            {{t "pages.certification-technical-error.candidate.cancelled.title"}}
          </p>
          <p class="certification-technical-error-results__steps">{{t "pages.certification-technical-error.candidate.cancelled.step-1"}}</p>
        {{else}}
          <h2 class="certification-technical-error-results__disclaimer">{{t "pages.certification-ender.results.disclaimer"}}</h2>
          <p class="certification-technical-error-results__title">
            {{t "pages.certification-ender.results.title"}}
          </p>
          <p class="certification-technical-error-results__steps">{{t "pages.certification-ender.results.step-1"}}</p>
          <p class="certification-technical-error-results__steps">{{t "pages.certification-ender.results.step-2"}}</p>
        {{/if}}
      </div>
    </PixBlock>
  </template>
}
