import React, { useState } from 'react';
import ReactModal from 'react-modal';
import Select from 'react-select'
import STAGES from '../../constants/stages'
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

const stages = Object.keys(STAGES).filter(s => s !== 'default').map(stage => ({
    value: stage,
    label: stage
}))

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

const Modal = (props) => {
    const [modalIsOpen, setIsOpen] = useState(false)
    const [data, setData] = useState(false)
    const [options, setOptions] = useState({})
    const { addToast, removeToast } = useToasts()

    const openModal = () => {
        setIsOpen(true);
    }

    const getData = async (type, id) => {
        if (props.mode === 'Edit' || props.mode === 'View') {
            try {
                const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=${type}&id=${id}`)
                if (result.status === 200) {
                    const body = await result.json()
                    console.log(body)
                    setData(body.rows[0])
                }
            } catch (e) {
                console.error(e)
            }
        } else {
            setData(props.id ? {id: props.id, fields: {}} : {fields: {}})
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
                setOptions({ ...obj, Stage: stages })
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
            label: row.fields[identifiers[field][1]]
        }))
    }

    const getInputType = field => {
        const obj = {
            type: 'text'
        }
        if (datetimeFields.includes(field)) obj.type = 'datetime-local'
        if (dateFields.includes(field)) obj.type = 'date'
        if (numberFields.includes(field) || currencyFields.includes(field)) obj.type = 'number'
        if (currencyFields.includes(field)) {
            obj.min = "0.01"
            obj.step = "0.01"
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
                                            ((Object.keys(optionsObj).includes(f) || f === 'Stage') ?
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
                                                <input
                                                    className={`input ${!data.fields[f] ? 'is-warning' : ''} ${props.mode === 'View' ? 'is-disabled' : ''}`}
                                                    value={datetimeFields.includes(f) && data.fields[f] ? toDatetimeLocal(data.fields[f]) : data.fields[f] || ''}
                                                    onChange={e => {
                                                        updateData(f, e.currentTarget.value)
                                                    }}
                                                    readOnly={readOnlyFields.includes(f) || props.mode === 'View'}
                                                    {...getInputType(f)}
                                                />)
                                        }
                                    </div>
                                )) :
                                <div className="panel-block">
                                    Loading...
                                </div>
                            }
                            <div className="level">
                                <div className="level-left">
                                    <button
                                        className="button is-danger"
                                        disabled={data ? '' : 'disabled'}
                                        onClick={closeModal}>
                                        Close
                            </button>
                                </div>
                                <div className="level-right">
                                    <button
                                        className="button is-warning"
                                        disabled={data ? '' : 'disabled'}
                                        onClick={handleSave}>
                                        Save &amp; close
                            </button>
                                </div>
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