# vue-router-auth
Flexible configuration of routes. Closing routes for authorized / unauthorized users.

This module is designed for the fact that you already have an authorization system and you need to close the pages for unauthorized / authorized users.

## :book: Usage

```bash
$ npm i vue-router-auth
```

```js
import Vue from 'vue';
import VueRouterAuth from 'vue-router-auth';

const options = {
  router,
  guard: ({ $auth }) => $auth.loggedIn,
};

Vue.use(VueRouterAuth, options);
```
or
```js
import { middleware } from 'vue-router-auth';

const options = {
  router,
  guard: ({ $auth }) => $auth.loggedIn,
};

router.beforeEach(middleware(options));
```

After which you need to configure the routes:

```js
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'login',
        component: () => import('pages/Login.vue'),
        meta: {
          auth: false,
          authRedirectTo: { path: '/account' },
        },
      },
    ],
  },
  {
    path: '/account',
    component: () => import('layouts/Auth.vue'),
    meta: {
      auth: true,
      authRedirectTo: { path: '/login' },
    },
    children: [
      {
        path: '',
        component: () => import('pages/Account.vue'),
      },
      {
        path: 'settings',
        component: () => import('pages/Settings.vue'),
      },
    ],
  },
];
```

## :gear: Customization
**Options**
List of passed options during initialization:

name    | default                                           | description                                                                                                                                                                                                                     | required | type
--------|---------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|--------
router  | -                                                 | app router                                                                                                                                                                                                                      | true     | Object
guard   | <pre>() => false</pre>                            | Function to check access. Must return a boolean value. It has a context argument: ***to***, ***from***, ***Vue.prototype*** and the context that was passed in the module option. Use read-only context (**must be redefined**) | true     | Function
routes  | <pre>{ guest: '/public', auth: '/account' }</pre> | Routes for redirecting authorized and unauthorized users                                                                                                                                                                        | false    | Object
context | <pre>{}</pre>                                     | The data that will be available in the guard function                                                                                                                                                                           | false    | Object

***If the guard function returns true - access to the page is allowed, false - is denied.***

Also, for full work, you need to configure the meta field in routes:

**Route options**
List of options passed to the meta route field:

name           | description                                                                                                                                   | type
---------------|-----------------------------------------------------------------------------------------------------------------------------------------------|--------
auth           | A flag indicating the closure of the route. ***true*** - only authorized users are allowed, ***false*** - only allowed for unauthorized users | Boolean
authRedirectTo | route or function returning a route.                                                                                                          | Function or Object or String
authGuard      | individual ***guard*** function for a specific route                                                                                          | Object

***functions authRedirectTo and authGuard have the same arguments as the **guard** function.***

You can set the check function and routes for redirection both for the entire application as a whole and for individual routes.
<br>
<br>
If the auth flag is set on the current or parent route (the current route is in priority), then the check will be performed using the authGuard function.
If it is not specified in the current and parent routes (the priority is the same) then the check will occur using the ***guard*** function.
<br>
<br>
If the user is logged in and tries to switch to the route with the auth: false flag set, then with the correct guard function,
redirection to the route from the authRedirectTo parameter set in the current or parent route (current priority) will occur.
If the authRedirectTo parameter is not set for the routes, the route from the options of the routes.auth module will be used.
And if a non-authorized user goes to a route with the auth: true flag, he will be redirected to authRedirectTo or routes.guest.

### :eyes: Examples
```js
import { middleware } from 'vue-router-auth';
import auth from 'auth-service'; // for example

const options = {
  router,
  guard: ({ auth }) => auth.loggedIn,
  context: {
    auth,
  },
  routes: {
     guest: { path: '/' },
     auth: { path: '/office' },
  },
};

router.beforeEach(middleware(options));
```
```js
const routes = [
  {
    path: 'login',
    component: () => import('pages/Login.vue'),
    meta: {
      auth: false,
      authRedirectTo: { path: '/account' },
      authGuard: ({ auth }) => !auth.loggedIn,
    },
  },
  {
    path: '/account',
    component: () => import('layouts/Auth.vue'),
    meta: {
      auth: true,
      authRedirectTo: { path: '/login' },
    },
    children: [
      {
        path: '',
        component: () => import('pages/Account.vue'),
      },
      {
        path: 'settings',
        component: () => import('pages/Settings.vue'),
      },
      {
        path: 'payments',
        component: () => import('pages/Payments.vue'),
        meta: {
          auth: false,
        },
      },
    ],
  },
];
```

## :copyright: License

[MIT](http://opensource.org/licenses/MIT)
