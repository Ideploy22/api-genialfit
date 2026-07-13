import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class DeviceJwtGuard extends AuthGuard("device-jwt") {}
