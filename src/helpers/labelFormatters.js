import React from 'react'
import Modal from '../components/Modal'
import { Tooltip, Whisper } from 'rsuite'

import { UsersContext } from '../components/layout'
import { FiMaximize2, FiMoreHorizontal, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'

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

export const ColoredCell = props => {
    const { colors, value } = props
    const color = colors[value] ? colors[value] : colors['default']
    if (value) {
        return (
            <button
                className="button is-rounded is-small"
                style={{
                    'backgroundColor': color
                }}
            >
                {value}
            </button>
        )
    } else {
        return value
    }
}

export const CreatorCell = ({ value }) => {
    if (value) {
        return (
            <UsersContext.Consumer>
                {users => {
                    const user = users.filter(u => u.uid === value)[0]
                    return user ? `${user.username} (${user.email})` : ''
                }}
            </UsersContext.Consumer>
        )
    } else {
        return ''
    }
}

export const MultiRecordCell = ({ value, row, type, user, text }) => {
    console.log(type)
    if (value && Array.isArray(value)) {
        return <div className="level actions">
            <div className="level-left">
                <div className="level-item">
                    {
                        text ? text : value.length + ' record/s'
                    }
                </div>
            </div>
            <UsersContext.Consumer>
                {users => (
                    <div className="level-right">
                        {
                            value.length ?
                                <div className="level-item">
                                    <Modal
                                        button={
                                            <Whisper placement="top" speaker={<Tooltip>{`See all ${type}`}</Tooltip>}>
                                                <FiMoreHorizontal />
                                            </Whisper>
                                        }
                                        id={row.id}
                                        type={type === 'Install / Maintenance' ? 'Maintenance' : type}
                                        mode="List"
                                        users={users}
                                    >
                                    </Modal>
                                </div> :
                                <></>
                        }
                        <div className="level-item">
                            <Modal
                                button={
                                    <Whisper placement="top" speaker={<Tooltip>{`Add new ${type}`}</Tooltip>}>
                                        <FiPlus />
                                    </Whisper>
                                }
                                id={row.id}
                                user={user}
                                users={users}
                                type={type === 'Install / Maintenance' ? 'Maintenance' : type}
                                mode="New"
                            >
                            </Modal>
                        </div>
                    </div>
                )}
            </UsersContext.Consumer>
        </div>
    } else {
        return ''
    }
}

export const CountCell = ({ value, row, colors, colorKey }) => {
    if (colors && colorKey) {
        const color = colors[row[colorKey]] ? colors[row[colorKey]] : '#fff'
        return <div
            style={{
                'textAlign': 'center',
                'borderRight': '5px solid ' + color,
                'marginRight': -8,
                'paddingRight': 2
            }}
        >
            {value}
        </div>
    } else {
        return value
    }
}

export const EditCell = ({ row, user, type, onCloseModal }) => {
    return <div className="level actions">
        <div className="level-item">
            <UsersContext.Consumer>
                {users => (
                    <Modal
                        button={<FiEdit />}
                        id={row.id}
                        type={type}
                        user={user}
                        users={users}
                        mode="Edit"
                        onCloseModal={onCloseModal}
                    >
                    </Modal>
                )}
            </UsersContext.Consumer>
        </div>
    </div>
}

export const DeleteCell = ({ row, user, type, titleKey, onCloseModal }) => {
    return <div className="level actions">
        <div className="level-item">
            <Modal
                button={<FiTrash2 />}
                id={row.id}
                title={row[titleKey]}
                type={type}
                user={user}
                mode="Delete"
                onCloseModal={onCloseModal}
            >
            </Modal>
        </div>
    </div>
}