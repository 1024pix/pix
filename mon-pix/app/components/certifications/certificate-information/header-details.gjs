import { PixBlock } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';

import parseISODateOnly from '../../../utils/parse-iso-date-only';

export default class HeaderDetails extends Component {
  get birthdateMidnightLocalTime() {
    return parseISODateOnly(this.args.certificate.birthdate);
  }

  <template>
    <PixBlock class="v2-header-details">
      <div class="v2-header-details__information">
        <div class="user-certification-hexagon-score">
          <div class="user-certification-hexagon-score__content">
            <p class="user-certification-hexagon-score__content-title">{{t "common.pix"}}</p>
            <p class="user-certification-hexagon-score__content-pix-score">{{@certificate.pixScore}}</p>
            <p class="user-certification-hexagon-score__content-certified">{{t
                "pages.certificate.hexagon-score.certified"
              }}</p>
          </div>
        </div>
        <div class="v2-header-details-information">
          <h1>{{t "pages.certificate.title"}}</h1>

          <ul>
            <li class="v2-header-details-information--grey">
              {{t "pages.certificate.issued-on"}}
              {{dayjsFormat @certificate.deliveredAt "D MMMM YYYY"}}
            </li>
            <li>
              {{@certificate.fullName}}
            </li>
            <li class="v2-header-details-information--bold">
              {{#if @certificate.birthplace}}
                {{t
                  "pages.certificate.candidate-birth-complete"
                  birthdate=(dayjsFormat this.birthdateMidnightLocalTime "D MMMM YYYY")
                  birthplace=@certificate.birthplace
                }}
              {{else}}
                {{t
                  "pages.certificate.candidate-birth"
                  birthdate=(dayjsFormat this.birthdateMidnightLocalTime "D MMMM YYYY")
                }}
              {{/if}}
            </li>
            {{#if @certificate.certificationCenter}}
              <li>{{t "pages.certificate.certification-center"}} {{@certificate.certificationCenter}}</li>
            {{/if}}
            <li>{{t "pages.certificate.exam-date"}} {{dayjsFormat @certificate.date "D MMMM YYYY"}}</li>
          </ul>

          {{#if @certificate.shouldDisplayProfessionalizingWarning}}
            <p class="v2-header-details-information--professionalizing-warning">
              {{t "pages.certificate.professionalizing-warning"}}</p>
          {{/if}}
        </div>
      </div>
    </PixBlock>
  </template>
}
