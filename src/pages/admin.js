import React, { Fragment } from 'react';
import { compose } from 'recompose';

import Layout from '../components/layout';
import {
  withAuthorization,
  withEmailVerification,
} from '../components/Session';
import { UserList } from '../components/Users';
import { ROLES } from '../constants/roles';

const AdminPageBase = () => (
  <Fragment>
    <div className="title is-3">Users list</div>

    <UserList />
  </Fragment>
);

const condition = authUser =>
  authUser && !!authUser.roles[ROLES.ADMIN];

const AdminPage = compose(
  withEmailVerification,
  withAuthorization(condition),
)(AdminPageBase);

export default () => (
  <AdminPage />
);
