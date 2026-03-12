import { createBrowserRouter } from 'react-router-dom'
import Layout          from './components/layout/Layout'
import Home            from './pages/Home'
import Portfolio       from './pages/Portfolio'
import Auth            from './pages/Auth'
import My              from './pages/My'
import UserPortfolio   from './pages/UserPortfolio'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/',              element: <Home /> },
      { path: '/portfolio/:id', element: <Portfolio /> },
      { path: '/auth',          element: <Auth /> },
      { path: '/my',            element: <My /> },
      { path: '/:username',     element: <UserPortfolio /> },
    ]
  }
])
