import Vue from 'vue';

const defaults = {
  routes: {
    guest: '/public',
    auth: '/account',
  },
};

function getRouteByMetaKey(route, key) {
  const matched = [route, ...route.matched];

  return matched.find((r) => r.meta.auth && typeof r.meta.auth[key] !== 'undefined');
}

function getMetaValue(route, key) {
  const metaRoute = getRouteByMetaKey(route, key);

  return metaRoute ? metaRoute.meta.auth[key] : null;
}

function verify(route, context, defaultGuard) {
  const routeGuard = getMetaValue(route, 'guard');

  return routeGuard ? routeGuard(context) : defaultGuard(context);
}

function getRouteTo(route, context) {
  const redirect = getMetaValue(route, 'redirect');

  return typeof redirect === 'function' ? redirect(context) : redirect;
}

export function middleware({
  router,
  guard = () => false,
  routes = {},
  context,
}) {
  return (to, from, next) => {
    const ctx = { to, from, ...Vue.prototype, ...context };
    const closureRoute = getRouteByMetaKey(to, 'access');
    const access = getMetaValue(to, 'access');
    const redirectRoutes = { ...defaults.routes, ...routes };
    const routeToCache = getRouteTo(to, ctx);
    const verifyCache = verify(to, ctx, guard);

    const actions = [
      {
        condition: closureRoute && typeof access === 'string' && access !== verifyCache,
        callback: () => router.replace(routeToCache || redirectRoutes[access]),
      },
      {
        condition: closureRoute && access && !verifyCache,
        callback: () => router.replace(routeToCache || redirectRoutes.guest),
      },
      {
        condition: closureRoute && !access && verifyCache,
        callback: () => router.replace(routeToCache || redirectRoutes.auth),
      },
      {
        condition: true,
        callback: () => next(),
      },
    ];

    actions.find((action) => action.condition).callback();
  };
}

export default {
  install(_Vue, options) {
    options.router.beforeEach(middleware(options));
  },
};
