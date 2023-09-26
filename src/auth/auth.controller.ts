import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import {
  Request,
} from "express";
import {
  EncryptService,
} from "src/encrypt/encrypt.service";
import {
  UserService,
} from "src/user/user.service";
import {
  SignInDTO,
  SignUpDTO,
} from "./dto";
import {
  AuthService,
} from "./auth.service";

@Controller()
export class AuthController {
  constructor(
    private readonly encryptService: EncryptService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) { }

  @Post("signup")
  public async signUp(@Req() req: Request, @Body() body: SignUpDTO) {
    const { email, nickname } = body;
    const existedEmail = await this.userService.findOneByEmail(email);
    if (this.authService.checkReservedWord(email) || existedEmail != null) {
      throw new HttpException("Duplicated email", HttpStatus.BAD_REQUEST);
    }
    const existedNickname = await this.userService.findOneByNickname(nickname);
    if (this.authService.checkReservedWord(nickname) || existedNickname != null) {
      throw new HttpException("Duplicated nickname", HttpStatus.BAD_REQUEST);
    }
    const password = this.encryptService.decode(body.password);
    const user = await this.userService.createUser(email, nickname, password);
    const { token: refreshToken, expiredAt: refreshTokenExpiredAt } = await this.authService.issueRefreshToken(user);
    const { token: accessToken, expiredAt: accessTokenExpiredAt } = await this.authService.issueAccessToken(user);
    const { agent, ip } = this.authService.getAgentAndIP(req);
    await this.authService.saveRefreshToken(user, refreshToken, refreshTokenExpiredAt, agent, ip);
    return { accessToken, accessTokenExpiredAt, refreshToken, refreshTokenExpiredAt };
  }

  @Post("signin")
  public async signin(@Req() req: Request, @Body() body: SignInDTO) {
    const user = await this.userService.signWithEmail(body.email);
    if (user == null) {
      throw new HttpException("Unable to signin", HttpStatus.UNAUTHORIZED);
    }
    const password = this.encryptService.decode(body.password);
    if (await this.userService.verifyPassword(user, password) == false) {
      throw new HttpException("Unable to signin", HttpStatus.UNAUTHORIZED);
    }
    const { token: refreshToken, expiredAt: refreshTokenExpiredAt } = await this.authService.issueRefreshToken(user);
    const { token: accessToken, expiredAt: accessTokenExpiredAt } = await this.authService.issueAccessToken(user);
    const { agent, ip } = this.authService.getAgentAndIP(req);
    await this.authService.saveRefreshToken(user, refreshToken, refreshTokenExpiredAt, agent, ip);
    return { accessToken, accessTokenExpiredAt, refreshToken, refreshTokenExpiredAt };
  }
}
