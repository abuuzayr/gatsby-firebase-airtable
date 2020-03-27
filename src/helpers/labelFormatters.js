import React from 'react'
import Modal from '../components/Modal'
import { Tooltip, Whisper } from 'rsuite'

import { STAGES } from '../constants/selections'
import { datetimeFields, currencyFields, largeFields } from '../constants/fields'
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
                        rowId={props.row.id}
                        type={props.type}
                        title={props.type}
                        mode="View"
                        users={users}
                        showRemarks
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

export const TextCell = ({ value }) => (
    <div style={{
        'overflow': 'scroll',
        'height': 50,
        'padding': '7px 0px',
        'whiteSpace': 'pre-wrap',
        'lineHeight': '1em',
    }}>
        {value}
    </div>
)

export const MultiRecordCell = ({ value, row, type, user, text, onCloseModal }) => {
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
                                        rowId={row.id}
                                        type={type === 'Install / Maintenance' ? 'Maintenance' : type}
                                        mode="List"
                                        users={users}
                                        title={type}
                                        showRemarks
                                        onCloseModal={onCloseModal}
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
                                rowId={row.id}
                                user={user}
                                users={users}
                                title={type}
                                type={type === 'Install / Maintenance' ? 'Maintenance' : type}
                                mode="New"
                                onCloseModal={onCloseModal}
                                showRemarks
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
                        rowId={row.id}
                        type={type}
                        title={type}
                        user={user}
                        users={users}
                        mode="Edit"
                        onCloseModal={onCloseModal}
                        showRemarks
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

const transformLabels = (user, labels, onCloseModal, includeCount, colWidth, remarks, remarksIndex) => {
    labels = labels.map(key => {
        const obj = {
            key,
            name: key,
            sortable: true,
            width: colWidth || 100,
            resizable: true
        }
        switch (key) {
            case 'Appointment name':
                obj.frozen = true
                obj.width = 250
                obj.formatter = props => <ExpandRow {...props} type="Appointments" />
                break
            case 'Text':
                obj.width = 300
                obj.formatter = props => <TextCell {...props} />
                break
            case 'Stage':
                obj.formatter = props => <ColoredCell {...props} colors={STAGES} />
                break
            case 'Creator':
                obj.formatter = props => <CreatorCell {...props} />
                break
            case 'Payments':
            case 'Install / Maintenance':
                obj.formatter = props => <MultiRecordCell {...props} type={key} user={user} onCloseModal={onCloseModal} />
                break
            case 'Model':
                obj.frozen = true
                obj.width = 250
                break
            default:
                break
        }
        if (datetimeFields.includes(key)) {
            obj.formatter = ({ value }) => value ? new Date(value).toLocaleString() : ''
        }
        if (currencyFields.includes(key)) {
            obj.formatter = ({ value }) => value ? `$${parseFloat(value).toFixed(2)}` : ''
        }
        if (largeFields.includes(key)) {
            obj.width = 180
        }
        return obj
    })
    if (includeCount) {
        if (!labels.map(l => l.key).includes('count')) {
            labels.unshift({
                key: 'count',
                name: '',
                width: 40,
                frozen: true,
                formatter: props => <CountCell {...props} colors={STAGES} colorKey="Stage" />
            })
        }
    }
    if (!!onCloseModal) {
        const added = labels.map(l => l.key).includes('edit') ? 1 : 0
        labels.splice(1, added, {
            key: 'edit',
            name: '',
            frozen: true,
            width: 30,
            formatter: props => <EditCell
                {...props}
                user={user}
                type="Appointments"
                onCloseModal={onCloseModal}
            />
        })
        labels.splice(labels.length - added, 1, {
            key: 'delete',
            name: '',
            width: 30,
            formatter: props => <DeleteCell
                {...props}
                user={user}
                type="Appointments"
                titleKey="Appointment name"
                onCloseModal={onCloseModal}
            />
        })
        if (remarks) {
            // Add remarks row
            labels.splice(labels.map(l => l.key).indexOf('delete') - added, added, {
                key: 'Remarks',
                name: 'Remarks',
                width: 180,
                formatter: (props) => {
                    const rm = remarks.filter(r => r.fields['Appointments'].includes(props.row.id))
                    if (rm.length > 0) {
                        rm.sort((a, b) => {
                            const aDate = new Date(a).getTime()
                            const bDate = new Date(b).getTime()
                            return bDate - aDate
                        })
                    }
                    return <MultiRecordCell
                        {...props}
                        value={rm}
                        text={rm.length ? rm[0]['fields']['Text'] : 'No remarks'}
                        type="Remarks"
                        user={user}
                        onCloseModal={onCloseModal}
                    />
                }
            })
        }
    }
    return labels
}

export default transformLabels