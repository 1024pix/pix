type OrganizationLearnerIdentityArgs = {
  id: number;
  firstName: string;
  lastName: string;
  birthdate?: string | null;
  division?: string | null;
  username?: string | null;
  userId?: number | null;
};

export class OrganizationLearnerIdentity {
  id: number;
  firstName: string;
  lastName: string;
  birthdate?: string | null;
  division?: string | null;
  username?: string | null;
  userId?: number | null;

  constructor(args: OrganizationLearnerIdentityArgs) {
    this.id = args.id;
    this.firstName = args.firstName;
    this.lastName = args.lastName;
    this.birthdate = args.birthdate;
    this.division = args.division;
    this.username = args.username;
    this.userId = args.userId;
  }

  generateUsername(generateLastPart?: () => string) {
    const normalizedFirstName = normalize(this.firstName);
    const normalizedLastName = normalize(this.lastName);
    const [, month, day] = this.birthdate?.split('-') ?? ['', '00', '00'];

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
