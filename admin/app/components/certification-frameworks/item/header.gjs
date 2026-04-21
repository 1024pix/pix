import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class Header extends Component {
  @service intl;

  get isComplementaryCertification() {
    return this.args.complementaryCertification;
  }

  get links() {
    return [
      {
        route: 'authenticated.certification-frameworks',
        label: this.intl.t('components.layout.sidebar.certification-frameworks'),
      },
      {
        label:
          this.args.complementaryCertification?.label || this.intl.t('components.certification-frameworks.labels.CORE'),
      },
    ];
  }

  <template>
    <header class="header">
      <PixBreadcrumb @links={{this.links}} class="breadcrumb" />
    </header>

    <div class="certification-framework-header">
      <h1 class="certification-framework-header__title">
        <small>
          {{#if this.isComplementaryCertification}}
            {{#if @complementaryCertification.hasComplementaryReferential}}
              {{t "components.complementary-certifications.item.certification-framework"}}
            {{else}}
              {{t "components.complementary-certifications.item.target-profile"}}
            {{/if}}
          {{else}}
            {{t "components.complementary-certifications.item.certification-framework"}}
          {{/if}}
        </small>
        <span>
          {{#if this.isComplementaryCertification}}
            {{@complementaryCertification.label}}
          {{else}}
            {{t "components.certification-frameworks.labels.CORE"}}
          {{/if}}
        </span>
      </h1>
    </div>
  </template>
}
