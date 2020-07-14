import React from 'react'
import { compose } from 'recompose'
import {
  withAuthorization,
} from '../components/Session'
import Leads from '../components/Leads'

const condition = authUser => !!authUser;

const LeadsPage = compose(
  withAuthorization(condition),
)(Leads);

export default (props) => (
  <LeadsPage {...props} />
);
