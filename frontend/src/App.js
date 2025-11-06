import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import AnnotatorDashboard from './components/AnnotatorDashboard';
import DataSpecialistDashboard from './components/DataSpecialistDashboard';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </ul>
          </nav>

          <hr />

          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <PrivateRoute path="/annotator-dashboard" component={AnnotatorDashboard} />
            <PrivateRoute path="/data-specialist-dashboard" component={DataSpecialistDashboard} />
            <Route path="/" component={Login} />
          </Switch>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
