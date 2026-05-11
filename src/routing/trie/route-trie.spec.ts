import { RouteTrie } from './route-trie';
import type { RuntimeRoute } from '../types/runtime-route.type';

function makeRoute(overrides: Partial<RuntimeRoute> = {}): RuntimeRoute {
  return {
    uid: 'test-uid',
    serviceId: 'svc-uid',
    serviceName: 'test-service',
    serviceProtocol: 'http',
    host: null,
    pathPattern: '/test',
    method: 'GET',
    stripPrefix: false,
    priority: 0,
    instances: [],
    ...overrides,
  };
}

describe('RouteTrie', () => {
  let trie: RouteTrie;

  beforeEach(() => {
    trie = new RouteTrie();
  });

  describe('static routing', () => {
    it('matches an exact static path', () => {
      const route = makeRoute({ pathPattern: '/users' });
      trie.insert('/users', route);
      const result = trie.match('/users');
      expect(result).not.toBeNull();
      expect(result!.route).toBe(route);
      expect(result!.params).toEqual({});
    });

    it('returns null for an unregistered path', () => {
      trie.insert('/users', makeRoute({ pathPattern: '/users' }));
      expect(trie.match('/posts')).toBeNull();
    });

    it('returns null for a deeper path when only parent is registered', () => {
      trie.insert('/users', makeRoute({ pathPattern: '/users' }));
      expect(trie.match('/users/123')).toBeNull();
    });

    it('matches a nested static path', () => {
      const route = makeRoute({ pathPattern: '/users/admin' });
      trie.insert('/users/admin', route);
      expect(trie.match('/users/admin')!.route).toBe(route);
    });

    it('matches root path "/"', () => {
      const route = makeRoute({ pathPattern: '/' });
      trie.insert('/', route);
      const result = trie.match('/');
      expect(result).not.toBeNull();
      expect(result!.route).toBe(route);
    });
  });

  describe('param routing', () => {
    it('captures a single param segment', () => {
      const route = makeRoute({ pathPattern: '/users/:id' });
      trie.insert('/users/:id', route);
      const result = trie.match('/users/123');
      expect(result).not.toBeNull();
      expect(result!.params).toEqual({ id: '123' });
      expect(result!.route).toBe(route);
    });

    it('captures multiple param segments', () => {
      const route = makeRoute({ pathPattern: '/orgs/:orgId/users/:userId' });
      trie.insert('/orgs/:orgId/users/:userId', route);
      const result = trie.match('/orgs/acme/users/42');
      expect(result).not.toBeNull();
      expect(result!.params).toEqual({ orgId: 'acme', userId: '42' });
    });

    it('returns null when path has too few segments', () => {
      trie.insert('/users/:id', makeRoute({ pathPattern: '/users/:id' }));
      expect(trie.match('/users')).toBeNull();
    });

    it('returns null when path has too many segments', () => {
      trie.insert('/users/:id', makeRoute({ pathPattern: '/users/:id' }));
      expect(trie.match('/users/123/extra')).toBeNull();
    });
  });

  describe('wildcard routing', () => {
    it('matches a path with one segment after wildcard prefix', () => {
      const route = makeRoute({ pathPattern: '/api/*' });
      trie.insert('/api/*', route);
      const result = trie.match('/api/anything');
      expect(result).not.toBeNull();
      expect(result!.route).toBe(route);
    });

    it('matches a path with multiple segments after wildcard prefix', () => {
      const route = makeRoute({ pathPattern: '/api/*' });
      trie.insert('/api/*', route);
      expect(trie.match('/api/v1/users/123')!.route).toBe(route);
    });

    it('returns null when only the wildcard prefix itself is matched', () => {
      trie.insert('/api/*', makeRoute({ pathPattern: '/api/*' }));
      expect(trie.match('/api')).toBeNull();
    });

    it('throws when wildcard is not the terminal segment', () => {
      expect(() => {
        trie.insert('/api/*/users', makeRoute({ pathPattern: '/api/*/users' }));
      }).toThrow('Wildcard must be the terminal segment');
    });
  });

  describe('match priority', () => {
    it('static child beats param child at the same depth', () => {
      const paramRoute = makeRoute({ pathPattern: '/users/:id', uid: 'param-route' });
      const staticRoute = makeRoute({ pathPattern: '/users/profile', uid: 'static-route' });
      trie.insert('/users/:id', paramRoute);
      trie.insert('/users/profile', staticRoute);
      const result = trie.match('/users/profile');
      expect(result!.route.uid).toBe('static-route');
    });

    it('param child beats wildcard at the same depth', () => {
      const wildcardRoute = makeRoute({ pathPattern: '/api/*', uid: 'wildcard-route' });
      const paramRoute = makeRoute({ pathPattern: '/api/:version', uid: 'param-route' });
      trie.insert('/api/*', wildcardRoute);
      trie.insert('/api/:version', paramRoute);
      const result = trie.match('/api/v2');
      expect(result!.route.uid).toBe('param-route');
    });

    it('higher-priority route wins among same-path same-method routes', () => {
      const low = makeRoute({ pathPattern: '/users/:id', uid: 'low', priority: 1 });
      const high = makeRoute({ pathPattern: '/users/:id', uid: 'high', priority: 10 });
      trie.insert('/users/:id', low);
      trie.insert('/users/:id', high);
      const result = trie.match('/users/42');
      expect(result!.route.uid).toBe('high');
    });
  });

  describe('backtracking', () => {
    it('falls back to param when static child leads to dead end', () => {
      const paramRoute = makeRoute({ pathPattern: '/a/:b/c', uid: 'param' });
      const staticRoute = makeRoute({ pathPattern: '/a/x', uid: 'static-dead-end' });
      trie.insert('/a/:b/c', paramRoute);
      trie.insert('/a/x', staticRoute);
      const result = trie.match('/a/x/c');
      expect(result!.route.uid).toBe('param');
      expect(result!.params).toEqual({ b: 'x' });
    });
  });
});
