import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GatewayOrchestratorService } from '../services/gateway-orchestrator.service.js';

@Controller()
export class GatewayController {
  constructor(private readonly orchestrator: GatewayOrchestratorService) {}

  @All('*')
  handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.orchestrator.handle(req, res);
  }
}
