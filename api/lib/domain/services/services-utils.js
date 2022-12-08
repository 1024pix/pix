const { ALL_TREATMENTS } = require('../constants');


function getEnabledTreatments(shouldApplyTreatments, deactivations) {
    return shouldApplyTreatments ? ALL_TREATMENTS.filter((treatment) => !deactivations[treatment]) : [];
}

module.exports = {
    getEnabledTreatments
};