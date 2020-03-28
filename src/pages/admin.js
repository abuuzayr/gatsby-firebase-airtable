import React, { Fragment } from 'react';
import { compose } from 'recompose';

import {
  withAuthorization,
} from '../components/Session';
import { UserList } from '../components/Users';
import { UsersContext } from '../components/layout'

const AdminPageBase = () => (
  <Fragment>
    <div className="title is-3">Users list</div>
    <UsersContext.Consumer>
      {users => <UserList users={users} />}
    </UsersContext.Consumer>
  </Fragment>
);

const condition = authUser =>
  authUser && authUser.role === 'ADMIN';

const AdminPage = compose(
  withAuthorization(condition),
)(AdminPageBase);

export default () => (
  <AdminPage />
);
