import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { pageTitle } from 'ember-page-title';
import Objectives from 'mon-pix/components/module/objectives';

export default class ModulixDetails extends Component {
  @service router;

  @action
  startModule() {
    this.router.transitionTo('module.details');
  }

  <template>
    {{pageTitle @module.title}}
    <main id="main" class="module-details" role="main">
      <div class="module-details__image">
        <img alt="" class="module-details-image__illustration" src={{@module.details.image}} height="150" />
      </div>

      <div class="module-details__content">
        <div class="module-details-content__layout">
          <h1 class="module-details-content-layout__title">{{@module.title}}</h1>

          <p class="module-details-content-layout__description">{{@module.details.description}}</p>

          <div class="module-details-content-layout__link">
            <PixButtonLink @route="module.passage" @model={{@module.id}} @size="large">{{t
                "pages.modulix.details.startModule"
              }}</PixButtonLink>
          </div>
        </div>
      </div>

      <div class="module-details__infos">
        <div class="module-details-infos__indications">
          <div class="module-details-infos-indications__category">
            <div class="module-details-infos-indications-category__title">
              <FaIcon @icon="stopwatch" class="module-details-infos-indications-category-title__icon" />{{t
                "pages.modulix.details.duration"
              }}
            </div>
            <p>{{t "pages.modulix.details.durationValue" htmlSafe=true duration=@module.details.duration}}</p>
          </div>
          <div class="module-details-infos-indications__category">
            <div class="module-details-infos-indications-category__title">
              <FaIcon @icon="signal" class="module-details-infos-indications-category-title__icon" />{{t
                "pages.modulix.details.level"
              }}
            </div>
            <p>{{@module.details.level}}</p>
          </div>
        </div>

        <div class="module-details-infos__objectives">
          <h2 class="module-details-infos-objectives__title">{{t "pages.modulix.details.objectives"}}</h2>
          <Objectives @objectives={{@module.details.objectives}} />
        </div>

        <div class="module-details-infos__explanation">
          <div class="module-details-infos-explanation__title">
            <h2>{{t "pages.modulix.details.explanationTitle"}}</h2>
          </div>
          <p class="module-details-infos-explanation__text">{{t "pages.modulix.details.explanationText1"}}</p>
          <p class="module-details-infos-explanation__text">{{t "pages.modulix.details.explanationText2"}}</p>
        </div>
      </div>
    </main>
  </template>
}
