import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import Editor from './pages/Editor'
import Search from './pages/Search'
import Auth from './pages/Auth'
import My from './pages/My'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/',              element: <Home /> },
      { path: '/portfolio/:id', element: <Portfolio /> },
      { path: '/editor',        element: <Editor /> },
      { path: '/search',        element: <Search /> },
      { path: '/auth',          element: <Auth /> },
      { path: '/my',            element: <My /> },
    ]
  }
])
