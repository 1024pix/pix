import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { gt } from 'ember-truth-helpers';

import { CONNECTION_TYPES } from '../../constants/connection-types';
import Date from './date';
import Information from './information';
import InformationWrapper from './information-wrapper';
import IsCertifiable from './is-certifiable';

export default class LearnerHeaderInfo extends Component {
  @service intl;

  get connectionMethods() {
    if (this.args.authenticationMethods) {
      return this.args.authenticationMethods.map((element) => this.intl.t(CONNECTION_TYPES[element])).join(', ');
    }
    return null;
  }

  <template>
    <InformationWrapper class="learner-header-info">
      {{#if @isCertifiable}}
        <Information @contentClass="information--certifiable">
          <:title>
            <IsCertifiable @isCertifiable={{@isCertifiable}} />
          </:title>
          <:content>
            {{#unless @hideCertifiableAt}}
              <span class="information__content--date">
                <Date @date={{@certifiableAt}} />
              </span>
            {{/unless}}
          </:content>
        </Information>
      {{/if}}
      {{#if @group}}
        <Information>
          <:title>
            {{@groupName}}
          </:title>
          <:content>
            {{@group}}
          </:content>
        </Information>
      {{/if}}
      {{#if (gt this.connectionMethods.length 0)}}
        <Information>
          <:title>
            {{t "pages.sco-organization-participants.table.column.login-method"}}
          </:title>
          <:content>
            {{this.connectionMethods}}
          </:content>
        </Information>
      {{/if}}

    </InformationWrapper>
  </template>
}
