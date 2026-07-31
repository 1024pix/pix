import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';

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
  <section class="actions-container">
    <PixButtonLink @route="authenticated.certification-frameworks.certification-framework" @variant="secondary">
      {{t "common.actions.cancel"}}
    </PixButtonLink>
  </section>
</template>
