import type { RouteMatch } from '../types/route-match.type';
import type { RuntimeRoute } from '../types/runtime-route.type';

interface TrieNode {
  staticChildren: Map<string, TrieNode>;
  paramChild: TrieNode | null;
  paramName: string | null;
  wildcardRoute: RuntimeRoute | null;
  routes: RuntimeRoute[];
}

function createNode(): TrieNode {
  return {
    staticChildren: new Map(),
    paramChild: null,
    paramName: null,
    wildcardRoute: null,
    routes: [],
  };
}

export class RouteTrie {
  private readonly root: TrieNode = createNode();

  private split(path: string): string[] {
    return path
      .replace(/^\//, '')
      .split('/')
      .filter((s) => s.length > 0);
  }

  insert(path: string, route: RuntimeRoute): void {
    const segments = this.split(path);
    let node = this.root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (segment === '*') {
        if (i !== segments.length - 1) {
          throw new Error(`Wildcard must be the terminal segment in path: "${path}"`);
        }
        if (node.wildcardRoute === null || route.priority > node.wildcardRoute.priority) {
          node.wildcardRoute = route;
        }
        return;
      }

      if (segment.startsWith(':')) {
        if (node.paramChild === null) {
          node.paramChild = createNode();
          node.paramName = segment.slice(1);
        }
        node = node.paramChild;
        continue;
      }

      let child = node.staticChildren.get(segment);
      if (child === undefined) {
        child = createNode();
        node.staticChildren.set(segment, child);
      }
      node = child;
    }

    node.routes.push(route);
    node.routes.sort((a, b) => b.priority - a.priority);
  }

  match(path: string): RouteMatch | null {
    const segments = this.split(path);
    return this.matchNode(this.root, segments, 0, {});
  }

  private matchNode(
    node: TrieNode,
    segments: string[],
    index: number,
    params: Record<string, string>,
  ): RouteMatch | null {
    if (index === segments.length) {
      if (node.routes.length > 0) {
        return { route: node.routes[0], params };
      }
      if (node.wildcardRoute !== null) {
        return { route: node.wildcardRoute, params };
      }
      return null;
    }

    const segment = segments[index];

    const staticChild = node.staticChildren.get(segment);
    if (staticChild !== undefined) {
      const result = this.matchNode(staticChild, segments, index + 1, params);
      if (result !== null) return result;
    }

    if (node.paramChild !== null && node.paramName !== null) {
      const result = this.matchNode(node.paramChild, segments, index + 1, {
        ...params,
        [node.paramName]: segment,
      });
      if (result !== null) return result;
    }

    if (node.wildcardRoute !== null) {
      return { route: node.wildcardRoute, params };
    }

    return null;
  }
}
