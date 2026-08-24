import PixBackgroundHeader from '@1024pix/pix-ui/components/pix-background-header';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import PageTitle from 'mon-pix/components/ui/page-title';
import modifierDidInsert from 'mon-pix/modifiers/modifier-did-insert';
import { isEmbedAllowedOrigin } from 'mon-pix/utils/embed-allowed-origins';

export default class LLMPreviewComponent extends Component {
  @service
  embedApiProxy;

  @action
  listenForInitMessage() {
    window.addEventListener(
      'message',
      ({ origin, data, ports }) => {
        if (!isEmbedAllowedOrigin(origin)) return;
        if (!isInitMessage(data)) return;
        if (!data.enableFetchFromApi) return;
        const [requestsPort] = ports;
        this.embedApiProxy.forwardForPreview(this, requestsPort);
      },
      { once: true },
    );
  }

  <template>
    {{pageTitle (t "pages.llm-preview.title")}}

    <main class="main" role="main">
      <PixBackgroundHeader id="main" class="llm-preview__header">
        <PageTitle>
          <:title>{{t "pages.llm-preview.title"}}</:title>
        </PageTitle>

        <div>
          <iframe
            class="llm-preview__iframe"
            src="{{@controller.iframeSrc}}"
            title="{{t 'pages.llm-preview.title'}}"
            frameBorder="0"
            {{modifierDidInsert this.listenForInitMessage}}
          ></iframe>
        </div>
      </PixBackgroundHeader>
    </main>
  </template>
}

function isInitMessage(data) {
  if (typeof data !== 'object' || data === null) return false;
  return data.from === 'pix' && data.type === 'init';
}
