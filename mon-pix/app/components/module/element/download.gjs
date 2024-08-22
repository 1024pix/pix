import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { t } from 'ember-intl';
import ResponsiveListWideWrap from 'mon-pix/components/common/responsive-ul-wide-wrap';

import ModuleElement from './module-element';

export default class ModulixDownload extends ModuleElement {
  @action
  onDownload(downloadedFormat) {
    this.args.onDownload({ elementId: this.args.download.id, downloadedFormat });
  }

  <template>
    <div class="element-download">
      <div class="element-download__intro">{{t "pages.modulix.download.intro"}}</div>
      <p class="element-download__description">
        {{t "pages.modulix.download.description"}}
      </p>
      <div class="element-download__links-container">
        <ResponsiveListWideWrap>
          {{#each @download.files as |file|}}
            <li class="element-download__link">
              <div class="element-download-link__format" aria-hidden="true">{{t
                  "pages.modulix.download.format"
                  format=file.format
                }}</div>
              <PixButtonLink
                class="element-download-link__button"
                @href="{{file.url}}"
                aria-label="{{t 'pages.modulix.download.label' format=file.format}}"
                download
                {{on "click" (fn this.onDownload file.format)}}
              >
                {{t "pages.modulix.download.button"}}
              </PixButtonLink>
            </li>
          {{/each}}
        </ResponsiveListWideWrap>
      </div>
      <a
        class="element-download__documentation-link link"
        href="{{t 'pages.modulix.download.documentationLinkHref'}}"
        target="_blank"
      >
        {{t "pages.modulix.download.documentationLinkLabel"}}
        <FaIcon @icon="arrow-up-right-from-square" />
      </a>
    </div>
  </template>
}
