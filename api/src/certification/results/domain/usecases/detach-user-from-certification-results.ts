type NewCertificationResultRepository = {
  detachUser: (userId: number) => Promise<void>;
};

export async function detachUserFromCertificationResults({
  userId,
  newCertificationResultRepository,
}: {
  userId: number;
  newCertificationResultRepository: NewCertificationResultRepository;
}): Promise<void> {
  await newCertificationResultRepository.detachUser(userId);
}
