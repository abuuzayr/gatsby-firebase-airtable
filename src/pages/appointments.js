import React from 'react'
import { compose } from 'recompose'
import {
  withAuthorization,
} from '../components/Session'
import Appointments from '../components/Appointments'

const condition = authUser => !!authUser;

const AppointmentsPage = compose(
  withAuthorization(condition),
)(Appointments);

export default (props) => (
  <AppointmentsPage {...props} />
);
