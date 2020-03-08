import React, { useState } from 'react';
import ReactModal from 'react-modal';
import Select from 'react-select'
import STAGES from '../../constants/stages'
import { 
    fields,
    readOnlyFields,
    datetimeFields,
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

const Modal = (props) => {
    const [modalIsOpen, setIsOpen] = useState(false)
    const [data, setData] = useState(false)
    const [options, setOptions] = useState({})
    const { addToast, removeToast } = useToasts()

    const openModal = () => {
        setIsOpen(true);
    }

    const getData = async (type, id) => {
        try {
            const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=${type}&id=${id}`)
            if (result.status === 200) {
                const body = await result.json()
                setData(body.rows[0])
            }
        } catch (e) {
            console.error(e)
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
        if (props.type && props.id) {
            await getData(props.type, props.id)
            await getOptions()
        }
    }

    const closeModal = () => {
        setIsOpen(false);
    }

    const updateData = (key, data) => {
        setData(prevData => ({
            ...prevData,
            fields: {
                ...prevData.fields,
                [key]: data
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
        computedFields.forEach(field => {
            delete cleanData[field]
        })
        // Transform react-select fields
        Object.keys(optionsObj).forEach(field => {
            cleanData[field] = [cleanData[field].value]
        })
        selectFields.forEach(field => {
            cleanData[field] = cleanData[field].value
        })
        // Remove null fields
        Object.keys(cleanData).forEach(field => {
            let toDelete = false
            if (!cleanData[field]) toDelete = true
            if (cleanData[field] && cleanData[field].length === 1 && !cleanData[field][0]) toDelete = true
            if (toDelete) delete cleanData[field]
        })
        const postData = {
            id: data.id,
            fields: cleanData
        }
        // Save the record!
        base(props.type).update([postData], function (err, records) {
            removeToast(savingToast)
            if (err) {
                console.error(err);
                addToast(`Error while saving: ${err}`, { appearance: 'error', autoDismiss: true })
                return;
            }
            if (records.length > 0) {
                addToast('Saved!', { appearance: 'success', autoDismiss: true })
                closeModal()
            }
        });
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
                contentLabel="Example Modal"
                closeTimeoutMS={2000}
            >
                <div className="panel">
                    <div className="panel-heading">Edit</div>
                    {
                        data ? fields.filter(f => Object.keys(data.fields).includes(f)).map(f => (
                            <div className={['CX', 'SX'].includes(f) ? 'is-hidden' : 'panel-block'} key={f}>
                                <div className="level-left">
                                    {
                                        Object.keys(identifiers).includes(f) ? 
                                            identifiers[f][0] : f
                                    }
                                </div>
                                {
                                    (Object.keys(optionsObj).includes(f) || f === 'Stage') ?
                                        <Select
                                            options={options[f]}
                                            isLoading={!Object.keys(options).length}
                                            isDisabled={!Object.keys(options).length}
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
                                            readOnly={readOnlyFields.includes(f)}
                                            >
                                        </Select> :
                                        <input 
                                            className="input" 
                                            value={data.fields[f] || ''} 
                                            onChange={e => {
                                                updateData(f, e.currentTarget.value)
                                            }}
                                            readOnly={readOnlyFields.includes(f)}
                                            { ...getInputType(f) }
                                        />
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
                    {props.children}
                </div>
            </ReactModal>
        </div>
    );
}

export default Modal