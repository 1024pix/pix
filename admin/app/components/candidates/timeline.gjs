import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { concat } from '@ember/helper';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';

export default class Timeline extends Component {
  transformMetaToJSON(metadata) {
    if (!metadata) return '-';
    return JSON.stringify(metadata, undefined, 2);
  }

  <template>
    <section class="page">
      <PixBlock class="page-section" @shadow="light">
        <header class="header page-section__header">
          <h2 class="page-section__title">
            {{t "pages.candidate.title"}}
          </h2>
        </header>
        <PixTable @data={{@timeline.events}} @variant="admin" @caption={{t "pages.candidates.caption"}}>
          <:columns as |event context|>
            <PixTableColumn @context={{context}} class="table__column">
              <:header>
                {{t "pages.candidate.code"}}
              </:header>
              <:cell>
                {{t (concat "pages.candidate.events." event.code)}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="table__column">
              <:header>
                {{t "pages.candidate.when"}}
              </:header>
              <:cell>
                {{formatDate event.when format="long"}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="table__column">
              <:header>
                {{t "pages.candidate.metadata"}}
              </:header>
              <:cell>
                <pre>{{this.transformMetaToJSON event.metadata}}</pre>
              </:cell>
            </PixTableColumn>
          </:columns>
        </PixTable>
      </PixBlock>
    </section>
  </template>
}
