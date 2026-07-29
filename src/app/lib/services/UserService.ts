import { UserRepository } from '../repositories/UserRepository';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async getRole(userId: number) {
    if (userId === undefined || userId === null)
      throw new Error('Missing user ID');

    return await this.userRepository.getRole(userId);
  }
}