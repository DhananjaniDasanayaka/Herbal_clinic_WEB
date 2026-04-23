import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // Check if our user exists in the browser's local memory
  const user = JSON.parse(localStorage.getItem('herbalUser'));

  // If they are logged in, let them through (<Outlet /> renders the page). 
  // If not, instantly redirect them to the login page.
  return user && user.isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}