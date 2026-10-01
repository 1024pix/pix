import { PixIcon } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class FraudCertificationIssueReportFields extends Component {
  @service url;

  get fraudFormUrl() {
    return this.url.fraudFormUrl;
  }

  <template>
    <fieldset class='fraud-certification-issue-report-fields'>
      <div class='fraud-certification-issue-report-fields__radio-button'>
        <input
          id='input-radio-for-category-fraud'
          type='radio'
          name='fraud'
          checked={{@fraudCategory.isChecked}}
          {{on 'click' (fn @toggleOnCategory @fraudCategory)}}
        />
        <label for='input-radio-for-category-fraud'><span
          >{{@fraudCategory.categoryCode}}&nbsp;</span>{{@fraudCategory.categoryLabel}}</label>
      </div>
      {{#if @fraudCategory.isChecked}}
        <div class='fraud-certification-issue-report-fields__details'>
          <p>
            {{t
              'pages.session-finalization.add-issue-modal.actions.transmit-report'
              htmlSafe=true
              fraudFormUrl=this.fraudFormUrl
            }}
            <PixIcon @name='openNew' @title={{t 'navigation.external-link-title'}} />
          </p>
        </div>
      {{/if}}
    </fieldset>
  </template>
}
