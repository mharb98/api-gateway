import type { RuntimeRoute } from './runtime-route.type';

export interface RouteMatch {
  route: RuntimeRoute;
  params: Record<string, string>;
}
