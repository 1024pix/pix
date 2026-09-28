import { PixButton, PixButtonLink } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class EndCourseCustomButton extends Component {
  @service pixMetrics;
  @service router;

  get isInternalAppLink() {
    return this.args.buttonLink.startsWith('/') && Boolean(this.router.recognize(this.args.buttonLink));
  }

  get buttonLink() {
    const params = {};

    if (Number.isFinite(this.args.masteryRate)) {
      params.masteryPercentage = Number(this.args.masteryRate * 100).toFixed(0);
    }

    params.externalId = this.args.participantExternalId ?? undefined;
    params.stage = this.args.reachedStage?.get('threshold') ?? undefined;

    return buildUrl(this.args.buttonLink, params);
  }

  @action
  goToEmberRouteFromPath() {
    this.handleCustomButtonClick();
    this.router.transitionTo(this.args.buttonLink);
  }

  @action
  handleCustomButtonDisplay() {
    this.pixMetrics.trackEvent('Présence d’un bouton comportant un lien externe', {
      disabled: true,
      category: 'Fin de parcours',
      action: "Affichage du bloc de l'organisation",
    });
  }

  @action
  handleCustomButtonClick() {
    this.pixMetrics.trackEvent('Clic sur le lien externe', {
      disabled: true,
      category: 'Fin de parcours',
      action: "Affichage du bloc de l'organisation",
    });
  }

  <template>
    {{this.handleCustomButtonDisplay}}
    {{#if this.isInternalAppLink}}
      <PixButton
        class="evaluation-results-hero-organization-block__link"
        @triggerAction={{this.goToEmberRouteFromPath}}
        @variant="primary"
        @size="large"
      >
        {{@buttonText}}
      </PixButton>
    {{else}}
      <PixButtonLink
        class="evaluation-results-hero-organization-block__link"
        @href={{this.buttonLink}}
        @variant="primary"
        @size="large"
        onclick={{this.handleCustomButtonClick}}
      >
        {{@buttonText}}
      </PixButtonLink>
    {{/if}}
  </template>
}

function buildUrl(customUrl, params) {
  const url = new URL(customUrl);
  const urlParams = new URLSearchParams(url.search);

  for (const key in params) {
    if (params[key] !== undefined) {
      urlParams.set(key, params[key]);
    }
  }
  url.search = urlParams.toString();
  return url.toString();
}
