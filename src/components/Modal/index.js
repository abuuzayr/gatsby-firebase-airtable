import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import Select from 'react-select'
import { DatePicker, Panel } from 'rsuite'
import '../../../node_modules/rsuite/dist/styles/rsuite-default.min.css'
import { CompanyContext } from '../Company'
import SELECTIONS from '../../constants/selections'
import ZONES from '../../constants/zones'
import { 
    fields,
    readOnlyFields,
    datetimeFields,
    dateFields,
    currencyFields,
    numberFields,
    options as optionsObj,
    identifiers,
    computedFields,
    selectFields,
    hiddenFields
} from '../../constants/fields'
import { useToasts } from 'react-toast-notifications'
import Airtable from 'airtable'

const base = new Airtable({ 
    apiKey: process.env.GATSBY_AIRTABLE_APIKEY 
}).base(process.env.GATSBY_AIRTABLE_BASE);

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 500,
        padding: 0,
        maxHeight: '100%'
    }
};

// Declare selections from constants
const selections = {}
Object.keys(SELECTIONS).forEach(s => {
    selections[s] = Object.keys(SELECTIONS[s]).map(select => ({
        value: select,
        label: select
    }))
})

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
ReactModal.setAppElement('#___gatsby')

const toDatetimeLocal = (str) => {
    let
        date = new Date(str),
        ten = function (i) {
            return (i < 10 ? '0' : '') + i;
        },
        YYYY = date.getFullYear(),
        MM = ten(date.getMonth() + 1),
        DD = ten(date.getDate()),
        HH = ten(date.getHours()),
        II = ten(date.getMinutes()),
        SS = ten(date.getSeconds())
        ;
    return YYYY + '-' + MM + '-' + DD + 'T' +
        HH + ':' + II + ':' + SS;
}

const defaultData = {
    'PX': [],
    'Unit': 1,
    'Discount': 0,
}

const Modal = (props) => {
    const [modalIsOpen, setIsOpen] = useState(false)
    const [company, setCompany] = useState(false)
    const [data, setData] = useState({ ...defaultData })
    const [options, setOptions] = useState({})
    const { addToast, removeToast } = useToasts()

    let formFields = fields[props.type]
    const blocks = formFields && formFields[0] === 'ENABLE_BLOCKS'
    if (blocks) {
        formFields = formFields.slice(1)
    }

    const Field = p => {
        const { field } = p
        return (
            <div className={hiddenFields.includes(field) ? 'is-hidden' : 'panel-block'}>
                <div className="level-left">
                    {
                        Object.keys(identifiers).includes(field) ?
                            identifiers[field][0] : field
                    }
                </div>
                {
                    ['Edit', 'View', 'New'].includes(props.mode) &&
                    ((Object.keys(optionsObj).includes(field) || selectFields.includes(field)) ?
                        <Select
                            options={options[field]}
                            isLoading={!Object.keys(options).length}
                            styles={{
                                container: provided => ({ ...provided, width: '100%' }),
                                menuList: provided => ({ 
                                    ...provided, 
                                    maxHeight: 100,
                                }),
                                option: provided => ({
                                    ...provided,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%',
                                    wordBreak: 'break-all',
                                    whiteSpace: 'nowrap'
                                }),
                            }}
                            onChange={val => {
                                updateData(field, val)
                            }}
                            value={
                                data[field] && data[field].hasOwnProperty('value') ?
                                    data[field] :
                                    {
                                        value: data[field],
                                        label: getLabel(data[field], field)
                                    }
                            }
                            isDisabled={
                                !Object.keys(options).length ||
                                (readOnlyFields.includes(field) || props.mode === 'View') ||
                                (field === 'Assign to' && data['Creator'] !== props.user.uid && props.user.roles.ADMIN !== 'ADMIN')
                            }
                        >
                        </Select> :
                        <>
                            {
                                currencyFields.includes(field) && <label style={{ 'marginRight': 10 }}>$</label>
                            }
                            {

                                datetimeFields.includes(field) || dateFields.includes(field) ?
                                    <DatePicker
                                        onChange={date => updateData(field, date)}
                                        value={data[field] ? new Date(data[field]) : null}
                                        format={datetimeFields.includes(field) ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"}
                                        ranges={[
                                            {
                                                label: datetimeFields.includes(field) ? "Now" : "Today",
                                                value: new Date()
                                            }
                                        ]}
                                    /> :
                                    <input
                                        value={data[field] || ''}
                                        onChange={e => {
                                            updateData(field, e.currentTarget.value)
                                        }}
                                        onBlur={e => {
                                            updateData(field, e.currentTarget.value, true)
                                        }}
                                        {...getInputProps(field, props)}
                                    />
                            }
                        </>
                    )
                }
            </div>
        )
    }

    const openModal = () => {
        setIsOpen(true);
    }
    
    useEffect(() => {
        if (!(company && company.companies.length)) return
        if (data && (!data['CX'] || !data['CX'].length)) {
            if (company.company.value && company.company.value !== 'All') {
                updateData('CX', company.company.value)
            } else {
                updateData('CX', company.companies.filter(c => c.fields['Company'] !== 'All')[0].id)
            }
        }
    }, [company])

    useEffect(() => {
        if (!options || !Object.keys(options).length) return
        const unit = data['Unit'] || 1
        const discount = data['Discount'] || 0
        let price = 0
        if (Array.isArray(data['PX'])) {
            const product = options['PX'].filter(p => p.value === data['PX'][0])[0]
            price = product ? product['fields']['Price'] : 0
        } else {
            price = data['PX'] ? data['PX']['fields']['Price'] : 0
        }
        const subTotal = unit * price - discount
        const GST = 0.07 * subTotal
        updateData('Price', price)
        updateData('GST', GST)
        updateData('Grand Total', subTotal + GST)
    }, [
        options,
        data['PX'],
        data['Unit'],
        data['Discount']
    ])

    useEffect(() => {
        if (data['Postal Code'] && data['Postal Code'].length === 6) {
            const area = data['Postal Code'].slice(0,2)
            let zone = 'Invalid Postal Code'
            Object.values(ZONES).forEach((zones, index) => {
                if (zones.includes(area)) zone = Object.keys(ZONES)[index]
            })
            updateData('Zone', zone)
        } else {
            updateData('Zone', 'Invalid Postal Code')
        }
    }, [data['Postal Code']])

    const getData = async (type, id) => {
        if (props.mode === 'Edit' || props.mode === 'View') {
            try {
                const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=${type}&id=${id}`)
                if (result.status === 200) {
                    const body = await result.json()
                    if (body.rows[0]) setData({
                        id: body.rows[0]['id'],
                        ...body.rows[0]['fields'],
                    })
                }
            } catch (e) {
                console.error(e)
            }
        } else {
            setData(props.id ? { id: props.id, ...defaultData } : { ...defaultData })
        }
    }

    const getOptions = async () => {
        try {
            const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getOptions`)
            if (result.status === 200) {
                const body = await result.json()
                const obj = {}
                Object.keys(optionsObj).map(option => {
                    obj[option] = buildOptions(body.rows[optionsObj[option]], option)
                })
                const userOptions = props.users.map(user => ({
                    value: user.uid,
                    label: `${user.username} (${user.email})`
                }))
                setOptions({ 
                    ...obj, 
                    Stage: selections['STAGES'],
                    Status: selections['STATUS'],
                    Job: selections['JOB'],
                    'Payment Mode': selections['PAYMENT_MODE'],
                    'Payment Status': selections['PAYMENT_STATUS'],
                    Source: selections['SOURCE'],
                    'Assign to': userOptions
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const afterOpenModal = async () => {
        if (props.type) {
            await getData(props.type, props.id)
            await getOptions()
        }
    }

    const closeModal = () => {
        setIsOpen(false)
        props.onCloseModal && props.onCloseModal()
    }

    const updateData = (key, value, blur) => {
        if (currencyFields.includes(key)) {
            if (blur || (!blur && readOnlyFields.includes(key))) {
                value = parseFloat(value)
                if (Number.isNaN(value) || !value) {
                    value = ''
                } else {
                    value = value.toFixed(2)
                }
            }
        }
        if (datetimeFields.includes(key)) {
            value = new Date(value).toISOString()
        }
        setData(prevData => ({
            ...prevData,
            [key]: value
        }))
    }

    const getLabel = (id, field) => {
        if (Array.isArray(id)) id = id[0]
        const optionKeys = Object.keys(options)
        if (!optionKeys.length) return ''
        if (optionKeys.includes(field)) {
            const found = options[field].filter(option => option.value === id)[0]
            return found ? found.label : ''
        }
    }

    const buildOptions = (rows, field) => {
        if (!Object.keys(identifiers).includes(field)) return rows
        return rows.map(row => ({
            value: row.id,
            label: row.fields[identifiers[field][1]],
            fields: row.fields
        }))
    }

    const getInputProps = (field, props) => {
        const obj = {
            type: 'text',
            className: 'input'
        }
        // input types
        if (datetimeFields.includes(field)) obj.type = 'datetime-local'
        if (dateFields.includes(field)) obj.type = 'date'
        if (numberFields.includes(field) || currencyFields.includes(field)) obj.type = 'number'
        if (numberFields.includes(field)) {
            obj.min = "1"
            obj.step = "1"
        }
        if (currencyFields.includes(field)) {
            obj.min = "0.01"
            obj.step = "1.00"
        }
        // input classes
        if (!data[field] && props.mode === 'Edit') obj.className += ' is-warning'
        if (props.mode === 'View') obj.className += ' is-disabled'
        // set readonly prop
        if (readOnlyFields.includes(field) || props.mode === 'View') {
            obj['readOnly'] = true
        }
        return obj
    }

    const handleSave = async () => {
        const savingToast = addToast('Saving...', { appearance: 'info' })
        const cleanData = { ...data }
        // Remove id from clean data
        delete cleanData['id']
        // Remove computed fields
        computedFields[props.type] && computedFields[props.type].forEach(field => {
            delete cleanData[field]
        })
        // Transform react-select fields
        Object.keys(optionsObj).forEach(field => {
            if (cleanData[field]) {
                cleanData[field] = [cleanData[field].value]
            }
        })
        selectFields.forEach(field => {
            if (cleanData[field]) {
                cleanData[field] = cleanData[field].value
            }
        })
        numberFields.forEach(field => {
            if (cleanData[field]) {
                cleanData[field] = parseInt(cleanData[field])
            }
        })
        currencyFields.forEach(field => {
            if (cleanData[field]) {
                cleanData[field] = parseFloat(cleanData[field])
            }
        })
        dateFields.forEach(field => {
            if (cleanData[field] && typeof cleanData === 'object') {
                try {
                    cleanData[field] = cleanData[field].getFullYear() + '-' + cleanData[field].getMonth() + 1 + '-' + cleanData[field].getDate()
                } catch {}
            }
        })
        // Remove null fields
        Object.keys(cleanData).forEach(field => {
            let toDelete = false
            if (!cleanData[field]) toDelete = true
            if (cleanData[field] && cleanData[field].length === 1 && !cleanData[field][0]) toDelete = true
            if (toDelete) delete cleanData[field]
        })
        // Add creator field
        if (props.mode === 'New') {
            cleanData['Creator'] = props.user.uid
        }
        // Save the record!
        if (data.hasOwnProperty('id')) {
            base(props.type).update([{ id: data.id, fields: cleanData }], function (err, records) {
                removeToast(savingToast)
                if (err) {
                    console.error(err);
                    addToast(`Error while saving: ${err}`, { appearance: 'error', autoDismiss: true })
                    return
                }
                if (records.length > 0) {
                    addToast('Saved!', { appearance: 'success', autoDismiss: true })
                    closeModal()
                }
            })
        } else {
            base(props.type).create([{ fields: cleanData }], function (err, records) {
                removeToast(savingToast)
                if (err) {
                    console.error(err);
                    addToast(`Error while saving: ${err}`, { appearance: 'error', autoDismiss: true })
                    return
                }
                if (records.length > 0) {
                    addToast('New record created!', { appearance: 'success', autoDismiss: true })
                    closeModal()
                }
            })
        }
    }

    const deleteRecord = () => {
        const savingToast = addToast('Deleting...', { appearance: 'info' })
        base(props.type).destroy([props.id], function (err, records) {
            removeToast(savingToast)
            if (err) {
                console.error(err);
                addToast(`Error while saving: ${err}`, { appearance: 'error', autoDismiss: true })
                return
            }
            if (records.length > 0) {
                addToast('Record successfully deleted', { appearance: 'success', autoDismiss: true })
                closeModal()
            }
        })
    }

    return (
        <div>
            {
                props.button ? 
                <div onClick={openModal}>
                    {props.button}
                </div> :
                <button onClick={openModal}>Open Modal</button>
            }
            <ReactModal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Record modal"
                closeTimeoutMS={2000}
            >
                <CompanyContext.Consumer>
                    {company => {
                        setCompany(company)
                        return <div className="panel">
                            <div className="panel-heading">{
                                props.mode + ' record ' + (props.title ? `: ${props.title}` : '')
                            }</div>
                            {
                                props.mode !== 'Delete' &&
                                <>
                                    {
                                        data ? 
                                        <>
                                            {
                                                blocks ? 
                                                formFields.map(block => {
                                                    if (block.name) {
                                                        return <Panel header={block.name} collapsible>
                                                            {
                                                                block.fields.map(f => <Field key={f} field={f} />)
                                                            }
                                                        </Panel>
                                                    } else {
                                                        return block.fields.map(f => <Field key={f} field={f} />)
                                                    }
                                                }) :
                                                formFields.map(f => {
                                                    return <Field field={f} />
                                                }) 
                                            }
                                        </> :
                                        <div className="panel-block">
                                            Loading...
                                        </div>
                                    }
                                    <div className="level">
                                        <div className={props.mode !== 'View' ? 'level-left' : 'level-item'}>
                                            <button
                                                className={`button is-danger ${props.mode === 'View' && 'is-fullwidth'}`}
                                                disabled={data ? '' : 'disabled'}
                                                onClick={closeModal}>
                                                Close
                                            </button>
                                        </div>
                                        {
                                            props.mode !== 'View' &&
                                            <div className="level-right">
                                                <button
                                                    className="button is-warning"
                                                    disabled={data ? '' : 'disabled'}
                                                    onClick={handleSave}>
                                                    Save &amp; close
                                                </button>
                                            </div>
                                        }
                                    </div>
                                </>
                            }
                            {
                                props.mode === 'Delete' &&
                                <>
                                    <div className="panel-block">Are you sure?</div>
                                    <div className="level">
                                        <div className="level-left">
                                            <button
                                                className="button is-success"
                                                onClick={closeModal}>
                                                Cancel
                                            </button>
                                        </div>
                                        <div className="level-right">
                                            <button
                                                className="button is-danger"
                                                onClick={deleteRecord}>
                                                Confirm Delete
                                            </button>
                                        </div>
                                    </div>
                                </>
                            }
                            {props.children}
                        </div>
                    }}
                </CompanyContext.Consumer>
            </ReactModal>
        </div>
    );
}

export default Modal