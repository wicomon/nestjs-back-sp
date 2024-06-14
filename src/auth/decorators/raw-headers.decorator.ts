import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    // console.log({ctx})
    const req = ctx.switchToHttp().getRequest();
    // console.log(req.rawHeaders)
    const rawHeaders = req.rawHeaders;


    return rawHeaders;
  }
)