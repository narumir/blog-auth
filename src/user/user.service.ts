import crypto from "crypto";
import argon from "argon2";
import {
  Injectable,
} from "@nestjs/common";
import {
  InjectRepository,
} from "@nestjs/typeorm";
import {
  Repository,
} from "typeorm";
import {
  User,
} from "src/entities";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, "readonly")
    private readonly readonlyUserRepository: Repository<User>,
    @InjectRepository(User, "writable")
    private readonly userRepository: Repository<User>,
  ) { }

  /** auth */
  findOneByUsername(username: string) {
    return this.readonlyUserRepository.createQueryBuilder("user")
      .where("user.username = :username", { username })
      .addSelect(["user.username", "user.password", "user.salt"])
      .getOne();
  }

  findOneByID(id: string) {
    return this.readonlyUserRepository.findOneBy({ id });
  }

  async verifyPassword(user: User, password: string) {
    const salt = Buffer.from(user.salt, "hex");
    const encryptedPasswrod = await argon.hash(password, { salt, type: argon.argon2id, raw: true });
    return user.password.equals(encryptedPasswrod);
  }

  async createUser(username: string, password: string, nickname: string) {
    const user = new User();
    user.username = username;
    const salt = crypto.randomBytes(32);
    user.salt = salt.toString("hex");
    const encryptedPasswrod = await argon.hash(password, { salt, type: argon.argon2id, raw: true });
    user.password = encryptedPasswrod;
    user.nickname = nickname;
    return this.userRepository.save(user);
  }

  async changePassword(userId: string, password: string) {
    const user = await this.findOneByID(userId);
    const salt = crypto.randomBytes(32);
    const encryptedPasswrod = await argon.hash(password, { salt, type: argon.argon2id, raw: true });
    user.salt = salt.toString("hex");
    user.password = encryptedPasswrod;
    return this.userRepository.save(user);
  }
}
