export class OrganizationLearnerIdentity {
  firstName: string;
  lastName: string;
  birthdate: string;

  constructor({ firstName, lastName, birthdate }: { firstName: string; lastName: string; birthdate: string }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
  }

  generateUsername(generateLastPart?: () => string) {
    const normalizedFirstName = normalize(this.firstName);
    const normalizedLastName = normalize(this.lastName);
    const [, month, day] = this.birthdate.split('-');

    const lastPart = generateLastPart?.() ?? `${day}${month}`;

    return `${normalizedFirstName}.${normalizedLastName}${lastPart}`;
  }
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '');
}
