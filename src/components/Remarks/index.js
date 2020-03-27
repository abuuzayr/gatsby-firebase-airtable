import React, { useState, useEffect } from 'react'
import DataGrid from 'react-data-grid'
import { Panel } from 'rsuite'
import { FiPlus } from 'react-icons/fi'
import { AiOutlineSortAscending } from 'react-icons/ai'
import transformLabels from '../../helpers/labelFormatters'
import { listLabels } from '../../constants/labels'
import Field from '../Modal/Field'
import { useToasts } from 'react-toast-notifications'
import Airtable from 'airtable'

const base = new Airtable({
    apiKey: process.env.GATSBY_AIRTABLE_APIKEY
}).base(process.env.GATSBY_AIRTABLE_BASE);

const Remarks = (props) => {
    const showTypeColumn = ['Appointments', 'Remarks'].includes(props.type)
    const [trigger, setTrigger] = useState(false)
    const [data, setData] = useState({
        labels: [],
        rows: []
    })
    const [remarksData, setRemarksData] = useState({
        'Type': {
            value: showTypeColumn ? 'Sales' : props.type,
            label: showTypeColumn ? 'Sales' : props.type
        },
        'Text': ''
    })
    const { user, options, getLabel, getInputProps, id, setExpandedProps, editing } = props
    const { addToast } = useToasts()

    useEffect(() => {
        async function getRemarks() {
            try {
                const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=Remarks`)
                if (result.status === 200) {
                    const body = await result.json()
                    setData({
                        labels: transformLabels(
                            user, 
                            showTypeColumn ? ['Type', ...listLabels['Remarks']] : listLabels['Remarks'], 
                            null, 
                            true
                        ),
                        rows: body.rows.filter(r => {
                            if (showTypeColumn)  return r.fields['Appointments'].includes(id)
                            return r.fields['Appointments'].includes(id) && r.fields['Type'] === props.type
                        }).map((row, index) => {
                            return {
                                ...row.fields,
                                index: index + 1,
                                id: row.id,
                                height: 200
                            }
                        })
                    })
                }
            } catch (e) {
                console.error(e)
            }
        }
        getRemarks()
    }, [user, trigger])

    useEffect(() => {
        if (!setExpandedProps) return
        setExpandedProps(
            data.rows.length && data.labels.length ?
            {} :  { expanded: true }
        )
    }, [data])

    const fieldProps = {
        props: {
            'mode': 'Edit',
            'user': user
        },
        options,
        updateData: (key, value) => {
            setRemarksData(prevData => ({
                ...prevData,
                [key]: value
            }))
        },
        data: remarksData,
        getLabel,
        getInputProps
    }

    const addRemark = () => {
        base('Remarks').create([{ fields: {
            'Type': remarksData['Type'].value,
            'Text': remarksData['Text'],
            'Creator': user.uid,
            'Appointments': [id]
        } }], function (err, records) {
            if (err) {
                console.error(err);
                addToast(`Error while adding remark: ${err}`, { appearance: 'error', autoDismiss: true })
                return
            }
            if (records.length > 0) {
                addToast('New remark added', { appearance: 'success', autoDismiss: true })
                setTrigger(p => !p)
            }
        })
    }

    return (
        <>
            {
                data.rows.length &&
                    data.labels.length ?
                    <div className="remarks">
                        <DataGrid
                            columns={data.labels}
                            rowGetter={i => ({ count: i + 1, ...data.rows[i] })}
                            rowsCount={data.rows.length}
                            minColumnWidth={35}
                            headerRowHeight={35}
                            rowHeight={50}
                            minHeight={data.rows * 50}
                        />
                    </div> :
                    <div style={{
                        'width': '100%',
                        'textAlign': 'center',
                        'border': '1px solid #ddd',
                        'padding': '10px',
                        'color': '#999',
                    }}>No remarks</div>
            }
            {
                editing &&
                <>
                    <div style={{ 'marginBottom': 10 }} />
                    {
                        showTypeColumn &&
                        <Field field="Type" {...fieldProps} />
                    }
                    <Field field="Text" {...fieldProps} />
                    <button
                        className="button is-small is-fullwidth is-info is-light"
                        style={{
                            margin: 10,
                            width: 'calc(100% - 20px)'
                        }}
                        onClick={addRemark}
                    ><FiPlus /> Add Remark</button>
                </>
            }
        </>
    )
};

const RemarksWithPanel = (props) => {
    const [expandedProps, setExpandedProps] = useState({})
    return props.showPanel ? 
        <Panel header="Remarks" collapsible {...expandedProps}>
            <Remarks {...props} setExpandedProps={setExpandedProps} />
        </Panel> :
        <Remarks {...props} />
}

export default RemarksWithPanel
