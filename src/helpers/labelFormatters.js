import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react'
import Modal from '../components/Modal'
import { Tooltip, Whisper, Checkbox, DatePicker } from 'rsuite'

import { STAGES, REMARKS_TYPES, PAYMENT_MODE, PAYMENT_METHOD, PAYMENT_STATUS, STATUS, JOB, SOURCE } from '../constants/selections'
import { datetimeFields, currencyFields, largeFields, booleanFields, numberFields, dateFields, computedFields, selectFields } from '../constants/fields'
import { UsersContext } from '../components/layout'
import { FiMaximize2, FiMoreHorizontal, FiPlus, FiEdit, FiTrash2, FiFileText } from 'react-icons/fi'
import { useToasts } from 'react-toast-notifications'
import Airtable from 'airtable'
import ZONES from '../constants/zones'

const base = new Airtable({
    apiKey: process.env.GATSBY_AIRTABLE_APIKEY
}).base(process.env.GATSBY_AIRTABLE_BASE);

const DateSelector = forwardRef(({ column, value, onCommit, time }, ref) => {
    const input = useRef(null)
    const [val, setVal] = useState(value ? new Date(value) : null)

    useEffect(() => {
        if (val) onCommit()
    }, [val])

    useImperativeHandle(ref, () => ({
        getValue() {
            return {
                [column.key]: val
            }
        },
        getInputNode() {
            return input.current
        }
    }))

    return (
        <DatePicker
            ref={input}
            onChange={setVal}
            value={val}
            format={time ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"}
            ranges={[
                {
                    label: time ? "Now" : "Today",
                    value: new Date()
                }
            ]}
        />
    );
})

const Selector = forwardRef(({ column, value, onCommit, options }, ref) => {
    const input = useRef(null)

    useImperativeHandle(ref, () => ({
        getValue() {
            return { 
                [column.key]: input.current && input.current.value 
            }
        },    
        getInputNode() {
            return input.current
        }
    }))

    return (
        <select
            ref={input}
            className=""
            defaultValue={value}
            onBlur={onCommit}
            size={options.length}
        >
            {options.map(name => (
                <option
                    key={name}
                    value={name}
                    onClick={onCommit}
                >
                    {name}
                </option>
            ))}
        </select>
    );
})

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

export const MultiRecordCell = ({ value, row, type, user, onCloseModal }) => {
    if (value && Array.isArray(value)) {
        return <div className="level actions">
            <UsersContext.Consumer>
                {users => (
                    <div className="level-item">
                        {
                            value.length ?
                                <Modal
                                    button={
                                        <Whisper placement="top" speaker={<Tooltip>{`See all ${type}`}</Tooltip>}>
                                            <span className="tag is-warning" style={{ marginRight: 5, cursor: 'pointer', fontWeight: 'normal' }}>View <FiMoreHorizontal /></span>
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
                                </Modal> :
                                <></>
                        }
                        <Modal
                            button={
                                <Whisper placement="top" speaker={<Tooltip>{`Add new ${type}`}</Tooltip>}>
                                    <span className="tag is-warning" style={{ marginRight: 5, cursor: 'pointer', fontWeight: 'normal' }}>Add <FiPlus /></span>
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
            resizable: true,
            editable: true
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
                obj.editable = false
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
            case 'Zone':
                obj.editable = false
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
        if (computedFields[p.type] && computedFields[p.type].includes(key)) {
            obj.editable = false
        }
        if (selectFields.includes(key)) {
            let options = []
            switch (key) {
                case 'Stage': 
                    options = STAGES
                    break
                case 'Status': 
                    options = STATUS
                    break
                case 'Job': 
                    options = JOB
                    break
                case 'Payment Mode': 
                    options = PAYMENT_MODE
                    break
                case 'Payment Method': 
                    options = PAYMENT_METHOD
                    break
                case 'Payment Status': 
                    options = PAYMENT_STATUS
                    break
                case 'Source': 
                    options = SOURCE
                    break
                case 'Type': 
                    options = REMARKS_TYPES
                    break
                default:
                    break
            }
            obj.editor = forwardRef((props, ref) => <Selector ref={ref} {...props} options={Object.keys(options)} />)
        }
        if (dateFields.includes(key)) {
            obj.editor = forwardRef((props, ref) => <DateSelector ref={ref} {...props} />)
        }
        if (datetimeFields.includes(key)) {
            obj.editor = forwardRef((props, ref) => <DateSelector ref={ref} {...props} time />)
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

export const updateRows = (id, fields, setRows) => {
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

export const updateData = async (type, id, fields, setRows, addToast, removeToast) => {
    if (!id || !fields) return
    // Fix datatypes if all sent as string
    Object.keys(fields).forEach(key => {
        try {
            if (key === 'Postal Code') {
                if (fields[key] && fields[key].length === 6) {
                    const area = fields[key].slice(0, 2)
                    let zone = 'Invalid Postal Code'
                    Object.values(ZONES).forEach((zones, index) => {
                        if (zones.includes(area)) zone = Object.keys(ZONES)[index]
                    })
                    fields['Zone'] = zone
                } else {
                    fields['Zone'] = 'Invalid Postal Code'
                }
            }
            if (currencyFields.includes(key)) fields[key] = fields[key] ? parseFloat(fields[key]) : 0
            if (numberFields.includes(key)) fields[key] = fields[key] ? parseInt(fields[key]) : 0
        } catch (e) {
            delete fields[key]
        }
        if (currencyFields.includes(key) || numberFields.includes(key)) {
            if (isNaN(fields[key])) delete fields[key]
        }
    })
    const prevFields = updateRows(id, fields, setRows)
    if (Object.keys(prevFields).every((key) => prevFields[key] === fields[key])) return
    const savingToast = addToast('Updating...', { appearance: 'info' })
    return await new Promise((resolve, reject) => {
        base(type).update([{ id, fields }], function (err, records) {
            removeToast(savingToast)
            if (err) {
                console.error(err);
                addToast(`Error while updating: ${err}`, { appearance: 'error', autoDismiss: true })
                updateRows(id, prevFields, setRows)
                reject()
            } else if (records.length > 0) {
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