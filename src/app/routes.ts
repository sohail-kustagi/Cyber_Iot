import { createBrowserRouter } from 'react-router';
import Login from '@/app/pages/Login';
import Dashboard from '@/app/pages/Dashboard';
import Graphs from '@/app/pages/Graphs';
import Settings from '@/app/pages/Settings';
import NotFound from '@/app/pages/NotFound';
import RequestAccess from '@/app/pages/RequestAccess';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/request-access',
    Component: RequestAccess,
  },
  {
    path: '/dashboard',
    Component: Dashboard,
  },
  {
    path: '/graphs',
    Component: Graphs,
  },
  {
    path: '/settings',
    Component: Settings,
  },
  {
    path: '*',
    Component: NotFound,
  },
]);