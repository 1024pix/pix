import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CampaignPresentation extends Component {
  @service currentUser;

  <template>
    <main class="campaign-presentation campaign-presentation--landing">
      <ul class="campaign-presentation__landing-logos">
        <li>
          <img src="/images/pix-logo.svg" alt={{t "common.pix"}} />
        </li>
        <li>
          <img src="/images/logo/logo-finance-par.svg" alt={{t "common.finance-par"}} />
        </li>
      </ul>
      <h1 class="campaign-presentation__landing-title">
        {{t "pages.campaign.presentation.landing.title" firstName=this.currentUser.user.firstName htmlSafe=true}}
      </h1>
      <PixButtonLink @route="campaigns.presentation.steps" @size="large">
        {{t "pages.campaign.presentation.landing.start-button" htmlSafe=true}}
      </PixButtonLink>
      <p class="campaign-presentation__landing-check-user">
        {{t
          "pages.campaign.presentation.landing.check-user"
          firstName=this.currentUser.user.firstName
          lastName=this.currentUser.user.lastName
          htmlSafe=true
        }}
        <PixButtonLink @route="logout" @variant="tertiary" @size="large">
          {{t "common.actions.sign-out"}}
        </PixButtonLink>
      </p>
    </main>
  </template>
}
