import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import Field from './Field'
import { Panel } from 'rsuite'
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
} from '../../constants/fields'
import { listLabels } from '../../constants/labels'
import transformLabels from '../../helpers/labelFormatters'
import { FiPlus } from 'react-icons/fi'
import { useToasts } from 'react-toast-notifications'
import Airtable from 'airtable'
import DataGrid from 'react-data-grid'

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
    'PX1': [],
    'PX2': [],
    'PX3': [],
    'PX4': [],
    'PX5': [],
    'PX6': [],
    'PX7': [],
    'PX8': [],
    'PX9': [],
    'Unit': 1,
    'Unit1': 1,
    'Unit2': 1,
    'Unit3': 1,
    'Unit4': 1,
    'Unit5': 1,
    'Unit6': 1,
    'Unit7': 1,
    'Unit8': 1,
    'Unit9': 1,
    'Discount': 0,
}

const Modal = (props) => {
    const [modalIsOpen, setIsOpen] = useState(false)
    const [company, setCompany] = useState(false)
    const [data, setData] = useState({ ...defaultData })
    const [options, setOptions] = useState({})
    const [hidden, setHidden] = useState(false)
    const [inputFields, setInputFields] = useState(false)
    const { addToast, removeToast } = useToasts()

    useEffect(() => {
        let formFields = fields[props.type]
        setInputFields(formFields)
    }, [])

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
        const products = [
            { unit: data['Unit'] || 1, price: 0},
            { unit: data['Unit1'] || 1, price: 0},
            { unit: data['Unit2'] || 1, price: 0},
            { unit: data['Unit3'] || 1, price: 0},
            { unit: data['Unit4'] || 1, price: 0},
            { unit: data['Unit5'] || 1, price: 0},
            { unit: data['Unit6'] || 1, price: 0},
            { unit: data['Unit7'] || 1, price: 0},
            { unit: data['Unit8'] || 1, price: 0},
            { unit: data['Unit9'] || 1, price: 0},
        ]
        const discount = data['Discount'] || 0
        for (let i = 0; i < 10; i ++) {
            const px = i > 0 ? 'PX' + i : 'PX'
            if (Array.isArray(data[px])) {
                const product = options[px].filter(p => p.value === data[px][0])[0]
                products[i]['price'] = product ? product['fields']['Price'] : 0
            } else {
                products[i]['price'] = data[px] ? data[px]['fields']['Price'] : 0
            }
        }
        const totalPrice = products.reduce((acc, curr) => acc += curr.unit * curr.price, 0)
        const subTotal = totalPrice - discount
        const GST = 0.07 * subTotal
        updateData('Total Price', totalPrice)
        updateData('Subtotal', subTotal)
        updateData('GST', GST)
        updateData('Grand Total', subTotal + GST)
    }, [
        options,
        data['PX'],
        data['Unit'],
        data['PX1'],
        data['Unit1'],
        data['PX2'],
        data['Unit2'],
        data['PX3'],
        data['Unit3'],
        data['PX4'],
        data['Unit4'],
        data['PX5'],
        data['Unit5'],
        data['PX6'],
        data['Unit6'],
        data['PX7'],
        data['Unit7'],
        data['PX8'],
        data['Unit8'],
        data['PX9'],
        data['Unit9'],
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
        let obj = {}
        if (['Edit', 'View', 'List'].includes(props.mode)) {
            try {
                let fetchUrl = `${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=${type}`
                if (id && props.mode !== 'List') fetchUrl += `&id=${id}`
                const result = await fetch(fetchUrl)
                if (result.status === 200) {
                    const body = await result.json()
                    if (props.mode === 'List') {
                        obj = body.rows
                    } else {
                        if (body.rows[0]) {
                            obj = {
                                id: body.rows[0]['id'],
                                ...body.rows[0]['fields'],
                            }
                        }
                    }
                }
            } catch (e) {
                console.error(e)
            }
        } else {
            obj = props.id ? { id: props.id, ...defaultData } : { ...defaultData }
        }
        if (props.mode === 'List' && id) obj = obj.filter(o => o.fields['Appointments'].includes(id))
        setData(obj)
        return obj
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
            const rData = await getData(props.type, props.id)
            await getOptions()
            if (props.type === 'Appointments' && !hidden) {
                console.log('mapping here')
                const blankPXFields = inputFields.find(f => f.name && f.name === 'Product').fields.map(field => {
                    if (field.includes('PX') && !(rData[field] && rData[field].length)) return field.split('PX')[1]
                }).filter(Boolean)
                if (JSON.stringify(hidden) !== JSON.stringify(blankPXFields)) setHidden(blankPXFields)
            }
        }
    }

    const closeModal = () => {
        setIsOpen(false)
        props.onCloseModal && props.onCloseModal()
    }

    const updateData = (key, value, blur) => {
        if (props.mode === 'List') return
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

    const getCleanData = (data, addCreator) => {
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
            if (cleanData[field] && typeof cleanData[field] === 'object') {
                try {
                    cleanData[field] = cleanData[field].getFullYear() + '-' + (cleanData[field].getMonth() + 1) + '-' + cleanData[field].getDate()
                } catch { }
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
        if (addCreator) {
            cleanData['Creator'] = props.user.uid
        }

        return cleanData
    }

    const handleSave = async () => {
        const savingToast = addToast('Saving...', { appearance: 'info' })
        let cleanData = {}
        let prefixedData = {}
        // Check if there are prefixed keys
        if (Object.keys(data).some(d => d.includes('---'))) {
            prefixedData = Object.keys(data).reduce((obj, key) => {
                if (key.includes('---')) {
                    const objKey = key.split('---')[0]
                    if (!obj.hasOwnProperty(objKey)) obj[objKey] = {}
                    obj[objKey][key.split('---')[1]] = data[key]
                }
                return obj
            }, {})
            Object.keys(prefixedData).forEach(key => {
                prefixedData[key] = getCleanData(prefixedData[key])
            })
            const toBeCleanedData = Object.keys(data).reduce((obj, key) => {
                if (!key.includes('---')) {
                    obj[key] = data[key]
                }
                return obj
            }, {})
            cleanData = getCleanData(toBeCleanedData, true)
        } else {
            cleanData = getCleanData(data, true)
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
                    if (Object.keys(prefixedData).length) {
                        Object.keys(prefixedData).forEach(key => {
                            let table = key
                            if (key === 'Payment') table = 'Payments'
                            if (key === 'Installation') table = 'Maintenance'
                            base(table).create([{ 
                                fields: {
                                    'Appointments': records.map(r => r.id), 
                                    ...prefixedData[key]
                                }
                            }], function (err, records) {
                                if (err) {
                                    console.error(err);
                                    addToast(`Error while saving: ${err}`, { appearance: 'error', autoDismiss: true })
                                    return
                                }
                                if (records.length > 0) {
                                    addToast(`${key} record created!`, { appearance: 'success', autoDismiss: true })
                                }
                            })
                        })
                    }
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

    const fieldProps = {
        props,
        options,
        updateData,
        data,
        getLabel,
        getInputProps,
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
                                !['Delete'].includes(props.mode)  &&
                                <>
                                    {
                                        data ? 
                                        <>
                                            {
                                                props.mode !== 'List' ?
                                                    inputFields && inputFields[0] === 'ENABLE_BLOCKS' ? 
                                                    inputFields.slice(1).map(block => {
                                                        if (block.mode && props.mode !== block.mode) return null
                                                        if (block.name) {
                                                            return <Panel header={block.name} key={block.name} collapsible>
                                                                {
                                                                    block.fields.map(f => {
                                                                        if (f.includes('PX') && hidden && hidden.includes(f.split('PX')[1])) return null
                                                                        if (f.includes('Unit') && hidden && hidden.includes(f.split('Unit')[1])) return null
                                                                        if (f === 'Total Price' && hidden && hidden.length) {
                                                                            return <>
                                                                                <button 
                                                                                    className="button is-small is-fullwidth is-info is-light"
                                                                                    style={{
                                                                                        margin: 10,
                                                                                        width: 'calc(100% - 20px)'
                                                                                    }}
                                                                                    onClick={() => {
                                                                                        setHidden(p => p.slice(1))
                                                                                    }}
                                                                                ><FiPlus /> Add product</button>
                                                                                <Field key={block.prefix ? `${block.name}---${f}` : f} field={block.prefix ? `${block.name}---${f}` : f} {...fieldProps } />
                                                                            </>
                                                                        }
                                                                        return <Field key={block.prefix ? `${block.name}---${f}` : f} field={block.prefix ? `${block.name}---${f}` : f} {...fieldProps} />
                                                                    })
                                                                }
                                                            </Panel>
                                                        } else {
                                                            return block.fields.map(f => <Field key={f} field={f} {...fieldProps} />)
                                                        }
                                                    }) :
                                                    inputFields && inputFields.map(f => <Field key={f} field={f} {...fieldProps} />) :
                                                Array.isArray(data) &&
                                                <DataGrid
                                                    columns={transformLabels(
                                                        props.authUser,
                                                        listLabels[props.type],
                                                        null,
                                                        true
                                                    )}
                                                    rowGetter={i => {
                                                        if (data[i]) {
                                                            return { 
                                                                count: i + 1, 
                                                                ...data[i].fields 
                                                            }
                                                        }
                                                    }}
                                                    rowsCount={data.length}
                                                    minColumnWidth={35}
                                                />
                                            }
                                        </> :
                                        <div className="panel-block">
                                            Loading...
                                        </div>
                                    }
                                    <div className="level">
                                        <div className={!['View', 'List'].includes(props.mode) ? 'level-left' : 'level-item'}>
                                            <button
                                                className={`button is-danger ${['View', 'List'].includes(props.mode) && 'is-fullwidth'}`}
                                                disabled={data ? '' : 'disabled'}
                                                onClick={closeModal}>
                                                Close
                                            </button>
                                        </div>
                                        {
                                            !['View', 'List'].includes(props.mode) &&
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