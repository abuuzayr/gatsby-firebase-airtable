import React from 'react';
import { Link } from 'gatsby';

import { AuthUserContext } from '../Session';
import SignOutButton from '../SignOut';
import ROUTES from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { FiLogIn, FiSettings  } from 'react-icons/fi'
import { IoMdPeople } from 'react-icons/io'

const Navigation = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <NavigationAuth authUser={authUser} />
      ) : (
        <NavigationNonAuth />
      )
    }
  </AuthUserContext.Consumer>
);

const NavigationAuth = ({ authUser }) => (
  <nav className="navbar is-white topNav">
    <div className="container">
      <div className="navbar-brand">
        <Link className="navbar-item" to={ROUTES.HOME}>
          <strong><IoMdPeople style={{ 'height': 30, 'width': 30 }} /></strong>
        </Link>
        <div className="navbar-burger burger" data-target="topNav">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div id="topNav" className="navbar-menu">
        <div className="navbar-start">
          {
            (authUser.roles[ROLES.SALES] || authUser.roles[ROLES.ADMIN]) &&
            <Link className="navbar-item" to={ROUTES.HOME}>Appointments</Link>
          }
          {
            (authUser.roles[ROLES.INSTALL] || authUser.roles[ROLES.ADMIN]) &&
            <Link className="navbar-item" to={ROUTES.MAINTAINENCE}>Install / Maintenance</Link>
          }
          {
            authUser.roles[ROLES.ADMIN] &&
            <Link className="navbar-item" to={ROUTES.PAYMENTS}>Payments</Link>
          }
          <Link className="navbar-item" to={ROUTES.PRODUCTS}>Products</Link>
          { 
            authUser.roles[ROLES.ADMIN] && 
              <Link className="navbar-item" to={ROUTES.ADMIN}>Admin</Link> 
          }
        </div>
        <div className="navbar-end">
          <div className="navbar-item">
            <Link className="navbar-item" to={ROUTES.ACCOUNT}>
              <FiSettings style={{ 'height': 20, 'width': 20 }} />
            </Link>
          </div>
          <div className="navbar-item">
            <div className="field is-grouped">
              <p className="control">
                <SignOutButton/>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

const NavigationNonAuth = () => (
  <nav className="navbar is-white topNav">
    <div className="container">
      <div id="topNav" className="navbar-menu">
        <div className="navbar-end">
          <div className="navbar-item">
            <div className="field is-grouped">
              <p className="control">
                <Link to={ROUTES.SIGN_IN} className="button is-small is-danger is-outlined">
                  <FiLogIn />
                  <span>Login</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

export default Navigation;
