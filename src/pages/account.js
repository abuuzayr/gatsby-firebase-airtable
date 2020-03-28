import React, { Fragment } from 'react';
import { compose } from 'recompose';

import Layout from '../components/layout';
import {
  AuthUserContext,
  withAuthorization,
} from '../components/Session';
import PasswordForgetForm from '../components/PasswordForget';
import PasswordChangeForm from '../components/PasswordChange';
import LoginManagement from '../components/LoginManagement';

const AccountPageBase = () => (
  <Fragment>
    <AuthUserContext.Consumer>
      {authUser => (
        <div>
          <div className="content">
            <div className="title is-3">
              Account details
            </div>
            <div>
              <strong>Email:</strong> {authUser.email}
            </div>
            <div>
              <strong>Role:</strong> {authUser.role}
            </div>
          </div>
          <div className="content">
            <div className="title is-4">
              Update email address
            </div>
            <PasswordForgetForm />
          </div>
          <div className="content">
            <div className="title is-4">
              Change password
            </div>
            <PasswordChangeForm />
          </div>
        </div>
      )}
    </AuthUserContext.Consumer>
  </Fragment>
);

const condition = authUser => !!authUser;

const AccountPage = compose(
  withAuthorization(condition),
)(AccountPageBase);

export default () => (
  <AccountPage />
);
