import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { UserEntity } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { Auth, RoleProtected } from './decorators';
import { IValidRoles } from './interfaces';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: 201, description: 'User Created', type: UserEntity })
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: UserEntity
  ){
    return this.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: UserEntity,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
  ) {
    // console.log(request);
    // console.log({user: request.user})
    // console.log({user})
    console.log({ rawHeaders });
    return {
      ok: true,
      user,
      userEmail,
      rawHeaders,
    };
  }

  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(IValidRoles.admin, IValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: UserEntity) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth(IValidRoles.admin)
  privateRoute3(@GetUser() user: UserEntity) {
    return {
      ok: true,
      user,
    };
  }
}
