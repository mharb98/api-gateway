import { Module } from '@nestjs/common';
import { DataAccessModule } from '../data-access/data-access.module';
import { MethodRouterService } from './services/method-router.service';
import { PathRewriterService } from './services/path-rewriter.service';
import { RouteLoaderService } from './services/route-loader.service';
import { RouteMatcherService } from './services/route-matcher.service';

@Module({
  imports: [DataAccessModule],
  providers: [MethodRouterService, RouteLoaderService, RouteMatcherService, PathRewriterService],
  exports: [RouteMatcherService, PathRewriterService, RouteLoaderService],
})
export class RoutingModule {}
