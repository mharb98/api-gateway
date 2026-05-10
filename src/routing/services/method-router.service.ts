import { Injectable } from '@nestjs/common';
import { HttpMethod } from '../../data-access/entities/route.entity';
import { RouteTrie } from '../trie/route-trie';
import type { RouteMatch } from '../types/route-match.type';
import type { RuntimeRoute } from '../types/runtime-route.type';

@Injectable()
export class MethodRouterService {
  private tries: Map<HttpMethod, RouteTrie>;

  constructor() {
    this.tries = this.buildFreshTries();
  }

  private buildFreshTries(): Map<HttpMethod, RouteTrie> {
    const map = new Map<HttpMethod, RouteTrie>();
    for (const method of Object.values(HttpMethod)) {
      map.set(method, new RouteTrie());
    }
    return map;
  }

  insert(route: RuntimeRoute): void {
    if (route.method !== null) {
      this.tries.get(route.method)!.insert(route.pathPattern, route);
      return;
    }
    for (const trie of this.tries.values()) {
      trie.insert(route.pathPattern, route);
    }
  }

  match(method: HttpMethod, path: string): RouteMatch | null {
    return this.tries.get(method)?.match(path) ?? null;
  }

  clear(): void {
    this.tries = this.buildFreshTries();
  }
}
