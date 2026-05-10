import { Injectable } from '@nestjs/common';
import { HttpMethod } from '../../data-access/entities/route.entity';
import type { RouteMatch } from '../types/route-match.type';
import { MethodRouterService } from './method-router.service';

@Injectable()
export class RouteMatcherService {
  constructor(private readonly methodRouterService: MethodRouterService) {}

  match(method: HttpMethod, path: string): RouteMatch | null {
    return this.methodRouterService.match(method, path);
  }
}
