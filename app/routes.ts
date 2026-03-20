import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
	route('/auth', './routes/auth.tsx'),
	route('/auth-confirm', './routes/auth-confirm.ts'),
	route('/auth/manage', './routes/auth-manage.ts'),
] satisfies RouteConfig;
