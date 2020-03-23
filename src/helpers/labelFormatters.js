import React from 'react'
import Modal from '../components/Modal'
import { UsersContext } from '../components/layout'
import { FiMaximize2 } from 'react-icons/fi'

export const ExpandRow = props => (
    <div className="level">
        <div className="level-left">{props.value}</div>
        <div className="level-right">
            <UsersContext.Consumer>
                {users => (
                    <Modal
                        button={<FiMaximize2 className="expand" />}
                        id={props.row.id}
                        type="Appointments"
                        mode="View"
                        users={users}
                    >
                    </Modal>
                )}
            </UsersContext.Consumer>
        </div>
    </div>
)