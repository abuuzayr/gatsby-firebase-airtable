import React from 'react'
import { compose } from 'recompose'
import {
  withAuthorization,
} from '../components/Session'
import Appointments from '../components/Appointments'
import Maintenance from '../components/Maintenance'

const HomePageBase = props => {
  if (!props.authUser) return
  return props.authUser.role === 'INSTALL' ?
    <Maintenance {...props} /> :
    <Appointments {...props} showStats={true} headers="Appointments" />
}

const condition = authUser => !!authUser;

const HomePage = compose(
  withAuthorization(condition),
)(HomePageBase);

export default (props) => (
  <HomePage {...props} />
);
