import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { IValidRoles } from "../interfaces";
import { AuthGuard } from "@nestjs/passport";
import { RoleProtected } from "./role-protected.decorator";
import { UserRoleGuard } from "../guards/user-role.guard";

export function Auth(...roles: IValidRoles[]){
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  )
}