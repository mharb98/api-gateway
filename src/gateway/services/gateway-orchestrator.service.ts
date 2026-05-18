import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { HttpMethod } from '../../data-access/entities/route.entity.js';
import { PathRewriterService } from '../../routing/services/path-rewriter.service.js';
import { RouteMatcherService } from '../../routing/services/route-matcher.service.js';
import { LoadBalancerService } from './load-balancer.service.js';
import { ProxyService } from './proxy.service.js';

@Injectable()
export class GatewayOrchestratorService {
  constructor(
    private readonly routeMatcher: RouteMatcherService,
    private readonly loadBalancer: LoadBalancerService,
    private readonly pathRewriter: PathRewriterService,
    private readonly proxy: ProxyService,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const method = req.method.toUpperCase() as HttpMethod;
    const path = req.path;

    const match = this.routeMatcher.match(method, path);

    if (!match) {
      throw new NotFoundException(`No route matched: ${method} ${path}`);
    }

    const instance = this.loadBalancer.pick(match.route);
    
    if (!instance) {
      throw new ServiceUnavailableException(
        `No available instances for service: ${match.route.serviceName}`,
      );
    }

    const rewrittenPath = this.pathRewriter.rewrite(path, match.route);
    
    const target = `${match.route.serviceProtocol}://${instance.host}:${instance.port}`;

    await this.proxy.forward(req, res, target, rewrittenPath);
  }
}
