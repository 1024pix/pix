const generateV3AttestationTemplate = (pdf, data) => {
  pdf.text(`${data.firstName} ${data.lastName}`);
};

export default generateV3AttestationTemplate;
