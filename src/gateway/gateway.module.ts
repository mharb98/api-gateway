import { Module } from '@nestjs/common';
import { RoutingModule } from '../routing/routing.module.js';
import { GatewayController } from './controllers/gateway.controller.js';
import { GatewayOrchestratorService } from './services/gateway-orchestrator.service.js';
import { LoadBalancerService } from './services/load-balancer.service.js';
import { ProxyService } from './services/proxy.service.js';

@Module({
  imports: [RoutingModule],
  controllers: [GatewayController],
  providers: [GatewayOrchestratorService, LoadBalancerService, ProxyService],
})
export class GatewayModule {}
