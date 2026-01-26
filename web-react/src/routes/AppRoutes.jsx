// src/routes/AppRoutes.jsx
import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import About from '../pages/About';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layout/MainLayout';
import UserLayout from '../layout/UserLayout';
import CarteLayout from '../layout/CarteLayout';
import UserList from '../pages/user/UserList';
import UserForm from '../pages/user/UserForm.jsx';
import UserDetail from '../pages/user/UserDetail.jsx';
import Map from '../pages/carte/Map.jsx';
import SignalementList from '../pages/signalement/SignalementList.jsx';
import SignalementDetail from '../pages/signalement/SignalementDetail.jsx';
import SignalementStatistics from '../pages/signalement/SignalementStatistics.jsx';

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
          {
            path: ':id',
            element: <UserDetail />,
          }
        ],
      },
      // Routes Carte - Gestion des problèmes routiers avec sous-layout
      {
        path: 'carte',
        element: <CarteLayout />,
        children: [
          {
            index: true,
            element: <Map />,
          },
          {
            path: 'signalements',
            element: <SignalementList />,
          },
          {
            path: 'signalements/:id',
            element: <SignalementDetail />,
          },
          {
            path: 'statistiques',
            element: <SignalementStatistics />,
          },
        ],
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