import React from 'react';
import { Link } from 'gatsby';

import { AuthUserContext } from '../Session';
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { FiLogIn, FiLogOut } from 'react-icons/fi'

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
          <strong>Liveinpure</strong>
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
            authUser.roles[ROLES.SALES] ||
            authUser.roles[ROLES.ADMIN] &&
            <Link className="navbar-item" to={ROUTES.ADMIN}>Opportunities</Link>
          }
          {
            authUser.roles[ROLES.INSTALL] ||
            authUser.roles[ROLES.ADMIN] &&
            <Link className="navbar-item" to={ROUTES.ADMIN}>Install / Maintenance</Link>
          }
          {
            authUser.roles[ROLES.ADMIN] &&
            <Link className="navbar-item" to={ROUTES.ADMIN}>Payments</Link>
          }
          <Link className="navbar-item" to={ROUTES.ADMIN}>Products</Link>
          <Link className="navbar-item" to={ROUTES.ACCOUNT}>Account</Link>
          { 
            authUser.roles[ROLES.ADMIN] && 
              <Link className="navbar-item" to={ROUTES.ADMIN}>Admin</Link> 
          }
        </div>
        <div className="navbar-end">
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
