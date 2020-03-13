import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import Select from 'react-select'
import SELECTIONS from '../../constants/selections'
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
    selectFields
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
    fields: {
        'PX': [],
        'Unit': 1,
        'Discount': 0,
    }
}

const Modal = (props) => {
    const [modalIsOpen, setIsOpen] = useState(false)
    const [data, setData] = useState({ ...defaultData })
    const [options, setOptions] = useState({})
    const { addToast, removeToast } = useToasts()

    const openModal = () => {
        setIsOpen(true);
    }

    useEffect(() => {
        if (!options || !Object.keys(options).length) return
        const unit = data.fields['Unit'] || 1
        const discount = data.fields['Discount'] || 0
        let price = 0
        if (Array.isArray(data.fields['PX'])) {
            const product = options['PX'].filter(p => p.value === data.fields['PX'][0])[0]
            price = product ? product.fields['Price'] : 0
        } else {
            price = data.fields['PX']['fields']['Price'] || 0
        }
        console.log(price)
        const subTotal = unit * price - discount
        const GST = 0.07 * subTotal
        updateData('Price', price)
        updateData('GST', GST)
        updateData('Grand Total', subTotal + GST)
    }, [
        options,
        data.fields['PX'],
        data.fields['Unit'],
        data.fields['Discount']
    ])


    const getData = async (type, id) => {
        if (props.mode === 'Edit' || props.mode === 'View') {
            try {
                const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=${type}&id=${id}`)
                if (result.status === 200) {
                    const body = await result.json()
                    if (body.rows[0]) setData(body.rows[0])
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
                setOptions({ 
                    ...obj, 
                    Stage: selections['STAGES'],
                    Status: selections['STATUS'],
                    Job: selections['JOB'],
                    'Payment Mode': selections['PAYMENT_MODE'],
                    'Payment Status': selections['PAYMENT_STATUS'],
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

    const updateData = (key, value) => {
        if (!value) return
        setData(prevData => ({
            ...prevData,
            fields: {
                ...prevData.fields,
                [key]: datetimeFields.includes(key) ? new Date(value).toISOString() : value
            }
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

    const getInputType = field => {
        const obj = {
            type: 'text'
        }
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
        return obj
    }

    const handleSave = async () => {
        const savingToast = addToast('Saving...', { appearance: 'info' })
        const cleanData = { ...data.fields }
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
        // Remove null fields
        Object.keys(cleanData).forEach(field => {
            let toDelete = false
            if (!cleanData[field]) toDelete = true
            if (cleanData[field] && cleanData[field].length === 1 && !cleanData[field][0]) toDelete = true
            if (toDelete) delete cleanData[field]
        })
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

    if (Object.keys(options).length) console.log("options: ", options)
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
                <div className="panel">
                    <div className="panel-heading">{
                        props.mode + ' record ' + (props.title ? `: ${props.title}` : '')
                    }</div>
                    {
                        props.mode !== 'Delete' &&
                        <>
                            {
                                data ? fields[props.type].map(f => (
                                    <div className={['CX', 'SX'].includes(f) ? 'is-hidden' : 'panel-block'} key={f}>
                                        <div className="level-left">
                                            {
                                                Object.keys(identifiers).includes(f) ?
                                                    identifiers[f][0] : f
                                            }
                                        </div>
                                        {
                                            ['Edit', 'View', 'New'].includes(props.mode) &&
                                            ((Object.keys(optionsObj).includes(f) || selectFields.includes(f)) ?
                                                <Select
                                                    options={options[f]}
                                                    isLoading={!Object.keys(options).length}
                                                    isDisabled={!Object.keys(options).length || props.mode === 'View'}
                                                    styles={{
                                                        container: provided => ({
                                                            ...provided,
                                                            width: '100%'
                                                        })
                                                    }}
                                                    onChange={val => {
                                                        updateData(f, val)
                                                    }}
                                                    value={
                                                        data.fields[f] && data.fields[f].hasOwnProperty('value') ?
                                                            data.fields[f] :
                                                            {
                                                                value: data.fields[f],
                                                                label: getLabel(data.fields[f], f)
                                                            }
                                                    }
                                                    readOnly={readOnlyFields.includes(f) || props.mode === 'View'}
                                                >
                                                </Select> :
                                                <>
                                                    {
                                                        currencyFields.includes(f) && <label style={{ 'marginRight': 10 }}>$</label>
                                                    }
                                                    <input
                                                        className={`input ${!data.fields[f] ? 'is-warning' : ''} ${props.mode === 'View' ? 'is-disabled' : ''}`}
                                                        value={
                                                            data.fields[f] ? 
                                                                (datetimeFields.includes(f) && toDatetimeLocal(data.fields[f])) ||
                                                                (currencyFields.includes(f) && parseFloat(data.fields[f]).toFixed(2)) ||
                                                                data.fields[f] :
                                                                    data.fields[f] || ''
                                                        }
                                                        onChange={e => {
                                                            updateData(f, e.currentTarget.value)
                                                        }}
                                                        readOnly={readOnlyFields.includes(f) || props.mode === 'View'}
                                                        {...getInputType(f)}
                                                    />
                                                </>)
                                        }
                                    </div>
                                )) :
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
            </ReactModal>
        </div>
    );
}

export default Modal