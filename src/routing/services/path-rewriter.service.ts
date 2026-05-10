import { Injectable } from '@nestjs/common';
import type { RuntimeRoute } from '../types/runtime-route.type';

@Injectable()
export class PathRewriterService {
  rewrite(originalPath: string, route: RuntimeRoute): string {
    if (!route.stripPrefix) {
      return originalPath;
    }

    if (route.pathPattern.endsWith('/*')) {
      const prefix = route.pathPattern.slice(0, -2);
      if (originalPath.startsWith(prefix)) {
        const remainder = originalPath.slice(prefix.length);
        return remainder.length > 0 ? remainder : '/';
      }
      return originalPath;
    }

    if (originalPath.startsWith(route.pathPattern)) {
      const remainder = originalPath.slice(route.pathPattern.length);
      return remainder.length > 0 ? remainder : '/';
    }

    return originalPath;
  }
}
