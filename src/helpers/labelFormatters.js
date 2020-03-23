import React from 'react'
import Modal from '../components/Modal'
import { Tooltip, Whisper } from 'rsuite'

import { UsersContext } from '../components/layout'
import { FiMaximize2, FiMoreHorizontal, FiPlus } from 'react-icons/fi'

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

export const MultiRecordCell = ({ value, row, key, user }) => {
    if (value && Array.isArray(value)) {
        return <div className="level actions">
            <div className="level-left">
                <div className="level-item">
                    {
                        value.length + ' record/s'
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
                                            <Whisper placement="top" speaker={<Tooltip>{`See all ${key}`}</Tooltip>}>
                                                <FiMoreHorizontal />
                                            </Whisper>
                                        }
                                        id={row.id}
                                        type={key === 'Install / Maintenance' ? 'Maintenance' : key}
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
                                    <Whisper placement="top" speaker={<Tooltip>{`Add new ${key}`}</Tooltip>}>
                                        <FiPlus />
                                    </Whisper>
                                }
                                id={row.id}
                                user={user}
                                users={users}
                                type={key === 'Install / Maintenance' ? 'Maintenance' : key}
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