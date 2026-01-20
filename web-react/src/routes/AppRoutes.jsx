// src/routes/AppRoutes.jsx
import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import About from '../pages/About';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layout/MainLayout';
import UserLayout from '../layout/UserLayout';
import UserList from '../pages/user/UserList';
import UserForm from '../pages/user/UserForm.jsx';
import MainCarte from "../pages/carte/MainCarte.jsx";

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      // Routes Utilisateurs avec sous-layout
      {
        path: 'users',
        element: <UserLayout />,
        children: [
          {
            index: true,
            element: <UserList />,
          },
          {
            path: 'add',
            element: <UserForm />,
          },
          // Routes futures pour view/edit
          // {
          //     path: ':id',
          //     element: <UserDetail />,
          // },
          // {
          //     path: ':id/edit',
          //     element: <UserEdit />,
          // },
        ],
      },
      // Route Carte - Gestion des problèmes routiers
      {
        path: 'map',
        element: <MainCarte />,
      },
      {
        path: 'stats',
        element: <div>Stats Page</div>,
      },
      {
        path: 'team',
        element: <div>Team Page</div>,
      },
      {
        path: 'settings',
        element: <div>Settings Page</div>,
      },
    ],
  },
]);

export default router;