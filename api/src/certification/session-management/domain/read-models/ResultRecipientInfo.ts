type ResultRecipientInfoProps = {
  id: number; // sessionId
  sessionDate: string;
  certificationCenter: string;
  emails: string[];
  emailsForClea: string[];
};

export class ResultRecipientInfo {
  #id: number;
  #sessionDate: string;
  #certificationCenter: string;
  #emails: string[];
  #emailsForClea: string[];

  constructor({ id, sessionDate, certificationCenter, emails, emailsForClea }: ResultRecipientInfoProps) {
    this.#id = id;
    this.#sessionDate = sessionDate;
    this.#certificationCenter = certificationCenter;
    this.#emails = [...emails];
    this.#emailsForClea = [...emailsForClea];
  }

  get id() {
    return this.#id;
  }

  get sessionDate() {
    return this.#sessionDate;
  }

  get certificationCenter() {
    return this.#certificationCenter;
  }

  get uniqueEmails() {
    return [...new Set(this.#emails.filter((email) => Boolean(email)))];
  }

  get uniqueEmailsForClea() {
    return [...new Set(this.#emailsForClea.filter((email) => Boolean(email)))];
  }
}
