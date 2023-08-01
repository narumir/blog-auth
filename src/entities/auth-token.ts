import {
  Column,
  Entity,
  ManyToOne,
} from "typeorm";
import {
  BaseEntity,
} from "./base-entity";
import {
  User,
} from "src/entities";

@Entity({
  name: "auth_token",
})
export class AuthToken extends BaseEntity {
  @Column({
    name: "browser",
    nullable: true,
    type: "varchar",
    length: 24,
  })
  browser: string;

  @Column({
    name: "browser_name",
    nullable: true,
    type: "varchar",
    length: 16,
  })
  browserVersion: string;

  @Column({
    name: "os",
    nullable: true,
    type: "varchar",
    length: 24,
  })
  os: string;

  @Column({
    name: "os_version",
    nullable: true,
    type: "varchar",
    length: 16,
  })
  osVersion: string;

  @Column({
    name: "token",
    nullable: false,
    type: "text",
  })
  token: string;

  @Column({
    name: "ip",
    nullable: false,
    type: "varchar",
    length: 39,
  })
  ip: string;

  @Column({
    name: "expired_at",
    nullable: false,
    type: "timestamptz",
  })
  expiredAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  user: User;
}
