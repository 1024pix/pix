import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';

export default class CertificationCalibreationForm extends Component {
  <template>
    <Card @title="Calibration des épreuves">
      <form id="version-calibration-form" class="versions-calibration__form">
        <section>
          <PixInput
            type="text"
            required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @errorMessage={{t
              "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
            }}
          >
            <:label>{{t
              "components.certification-frameworks.certification-framework.versions.calibration.calibration-id-input-label"
            }}</:label>
          </PixInput>

          <PixButton @type="button" @variant="primary">{{t
            "components.certification-frameworks.certification-framework.versions.calibration.verify-calibration-id-button"
          }}</PixButton>
        </section>
      </form>
    </Card>
  </template>
}
