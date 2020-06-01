import React from 'react'
import Modal from '../components/Modal'
import { Tooltip, Whisper, Checkbox } from 'rsuite'

import { STAGES, REMARKS_TYPES, PAYMENT_MODE, PAYMENT_METHOD, PAYMENT_STATUS } from '../constants/selections'
import { datetimeFields, currencyFields, largeFields, booleanFields, numberFields, dateFields } from '../constants/fields'
import { UsersContext } from '../components/layout'
import { FiMaximize2, FiMoreHorizontal, FiPlus, FiEdit, FiTrash2, FiFileText } from 'react-icons/fi'

import { useToasts } from 'react-toast-notifications'
import Airtable from 'airtable'

const base = new Airtable({
    apiKey: process.env.GATSBY_AIRTABLE_APIKEY
}).base(process.env.GATSBY_AIRTABLE_BASE);

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
                        showRemarks={type !== "Products"}
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

export const BooleanCell = ({ type, value, row, field, setRows }) => {
    const { addToast, removeToast } = useToasts()
    return <Checkbox
        checked={value}
        onChange={async (v, c) => {
            try {
                await updateData(type, row.id, {[field]: c}, setRows, addToast, removeToast)
            } catch (e) {}
        }}
    />
}

export const RemarksCell = ({ row, user, type, onCloseModal }) => {
    return <div className="level actions">
        <div className="level-item">
            <UsersContext.Consumer>
                {users => (
                    <Modal
                        button={<FiFileText />}
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
                )}
            </UsersContext.Consumer>
        </div>
    </div>
}

const transformLabels = (p, labels, onCloseModal, includeCount, colWidth, remarks) => {
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
                obj.width = 200
                obj.formatter = props => <ExpandRow {...props} type="Appointments" />
                break
            case 'Text':
                obj.width = 350
                obj.formatter = props => <TextCell {...props} />
                break
            case 'Stage':
                obj.formatter = props => <ColoredCell {...props} colors={STAGES} />
                break
            case 'Type':
                obj.formatter = props => <ColoredCell {...props} colors={REMARKS_TYPES} />
                break
            case 'Payment Mode':
                obj.formatter = props => <ColoredCell {...props} colors={PAYMENT_MODE} />
                break
            case 'Payment Method':
                obj.formatter = props => <ColoredCell {...props} colors={PAYMENT_METHOD} />
                break
            case 'Payment Status':
                obj.formatter = props => <ColoredCell {...props} colors={PAYMENT_STATUS} />
                break
            case 'Creator':
            case 'Assign to':
                obj.formatter = props => <CreatorCell {...props} />
                break
            case 'Payments':
            case 'Install / Maintenance':
                obj.width = 130
                obj.formatter = props => <MultiRecordCell {...props} type={key} user={p.user} onCloseModal={onCloseModal} />
                break
            case 'Model':
                obj.width = 250
                break
            case 'Priority':
                obj.frozen = true
                obj.width = 50
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
        if (numberFields.includes(key)) {
            obj.width = 50
            obj.formatter = ({value}) => <div className="level-item">{value}</div>
        }
        if (booleanFields.includes(key)) {
            obj.sortable = false
            obj.formatter = props => <BooleanCell {...props} type={p.type} field={key} setRows={p.setRows} />
            obj.width = 50
        }
        if (dateFields.includes(key)) {
            obj.formatter = ({ value }) => {
                if (!value) return ''
                const date = new Date(value)
                return date.getDate() + '/' + (date.getMonth() + 1) + '/' + (date.getYear() - 100)
            }
            obj.width = 80
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
                user={p.user}
                type={p.type}
                onCloseModal={onCloseModal}
            />
        })
        labels.splice(labels.length - added, 1, {
            key: 'delete',
            name: '',
            width: 30,
            formatter: props => <DeleteCell
                {...props}
                user={p.user}
                type={p.type}
                titleKey="Appointment name"
                onCloseModal={onCloseModal}
            />
        })
        if (remarks) {
            // Add remarks to the beginning
            labels.splice(2, added, {
                key: 'remarks',
                name: '',
                frozen: true,
                width: 30,
                formatter: props => <RemarksCell
                    {...props}
                    user={p.user}
                    type="Remarks"
                    onCloseModal={onCloseModal}
                />
            })
            // Add remarks to the end
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
                        user={p.user}
                        onCloseModal={onCloseModal}
                    />
                }
            })
        }
    }
    return labels
}

const updateRows = (id, fields, setRows) => {
    if (!setRows) return
    let prevRow = {}
    setRows(prevRows => {
        prevRow = { ...prevRows.find(p => p.id === id) }
        const rows = [...prevRows]
        const index = rows.findIndex(r => r.id === id)
        if (index < 0) return rows
        const row = rows[index]
        Object.entries(fields).forEach(field => {
            if (row.hasOwnProperty('fields')) {
                row['fields'][field[0]] = field[1]
            } else {
                row[field[0]] = field[1]
            }
        })
        rows[index] = row
        return rows
    })
    return Object.keys(fields).reduce((obj, key) => {
        obj[key] = prevRow[key]
        return obj
    }, {})
    
}

const updateData = async (type, id, fields, setRows, addToast, removeToast) => {
    if (!id || !fields) return
    const prevFields = updateRows(id, fields, setRows)
    const savingToast = addToast('Updating...', { appearance: 'info' })
    return await new Promise((resolve, reject) => {
        base(type).update([{ id, fields }], function (err, records) {
            removeToast(savingToast)
            if (err) {
                console.error(err);
                addToast(`Error while updating: ${err}`, { appearance: 'error', autoDismiss: true })
                updateRows(id, prevFields, setRows)
                reject()
            }
            if (records.length > 0) {
                addToast('Updated successfully!', { appearance: 'success', autoDismiss: true })
                resolve(records[0]["fields"])
            }
        })
    })
}

export const RowRenderer = ({ renderBaseRow, ...props }) => {
    return <div style={{ fontWeight: props.row['Confirmed'] ? 'bold' : 'normal' }}>
        {renderBaseRow(props)}
    </div>;
};

export default transformLabels