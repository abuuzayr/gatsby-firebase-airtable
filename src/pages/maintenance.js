import React from 'react';
import { compose } from 'recompose';
import {
  withAuthorization,
} from '../components/Session';
import Maintenance from '../components/Maintenance'

const condition = authUser => !!authUser;

const MaintenancePage = compose(
  withAuthorization(condition),
)(Maintenance);

export default (props) => (
  <MaintenancePage {...props} />
);
