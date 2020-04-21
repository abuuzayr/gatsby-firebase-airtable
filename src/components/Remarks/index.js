import React, { useState, useEffect } from 'react'
import DataGrid from 'react-data-grid'
import { Panel } from 'rsuite'
import { FiPlus, FiArrowDown, FiArrowUp } from 'react-icons/fi'
import { AiOutlineSortAscending } from 'react-icons/ai'
import transformLabels from '../../helpers/labelFormatters'
import { listLabels } from '../../constants/labels'
import Field from '../Modal/Field'
import { useToasts } from 'react-toast-notifications'
import Airtable from 'airtable'
import { datetimeFields } from '../../constants/fields'

const base = new Airtable({
    apiKey: process.env.GATSBY_AIRTABLE_APIKEY
}).base(process.env.GATSBY_AIRTABLE_BASE);

const Remarks = (props) => {
    const showTypeColumn = ['Appointments', 'Remarks'].includes(props.type)
    const [trigger, setTrigger] = useState(false)
    const [labels, setLabels] = useState([])
    const [rows, setRows] = useState([])
    const [initialRows, setInitialRows] = useState([])
    const [sort, setSort] = useState({
        column: '',
        direction: ''
    })
    const [remarksData, setRemarksData] = useState({
        'Type': {
            value: showTypeColumn ? 'Sales' : props.type,
            label: showTypeColumn ? 'Sales' : props.type
        },
        'Text': ''
    })
    const [remarkTypes, setRemarkTypes] = useState([])
    const { user, options, getLabel, getInputProps, id, setExpandedProps, editing } = props
    const { addToast } = useToasts()

    useEffect(() => {
        async function getRemarks() {
            try {
                const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=Remarks`)
                if (result.status === 200) {
                    const body = await result.json()
                    if (labels.length === 0) {
                        const labels = transformLabels(
                            {
                                user,
                                type: 'Remarks'
                            },
                            listLabels['Remarks'],
                            null,
                            true
                        ).map(label => {
                            if (label.key === 'count') label.width = 20
                            return label
                        })
                        setLabels(labels)
                    }
                    const rows = body.rows.filter(r => {
                        if (showTypeColumn) return r.fields['Appointments'].includes(id)
                        return r.fields['Appointments'].includes(id) && r.fields['Type'] === props.type
                    }).map((row, index) => {
                        return {
                            ...row.fields,
                            index: index + 1,
                            id: row.id,
                            height: 200
                        }
                    })
                    setRows(rows)
                    setInitialRows(rows)
                    setRemarkTypes(rows.reduce((arr, row) => {
                        if (!arr.includes(row['Type'])) {
                            arr = arr.concat([row['Type']])
                        }
                        return arr
                    }, []))
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
            rows.length && labels.length ?
            {} :  { expanded: true }
        )
    }, [rows, labels])

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

    const sortRows = (initialRows, sortColumn, sortDirection) => rows => {
        const comparer = (a, b) => {
            let A = a[sortColumn]
            let B = b[sortColumn]
            if (sortDirection === "ASC") {
                if (datetimeFields.includes(sortColumn)) {
                    A = A ? new Date(A).getTime() : new Date(new Date().getTime() + Math.pow(10, 12))
                    B = B ? new Date(B).getTime() : new Date(new Date().getTime() + Math.pow(10, 12))
                }
                return A > B ? 1 : -1;
            } else if (sortDirection === "DESC") {
                if (datetimeFields.includes(sortColumn)) {
                    A = A ? new Date(A).getTime() : new Date(null)
                    B = B ? new Date(B).getTime() : new Date(null)
                }
                return A < B ? 1 : -1;
            }
        };
        return sortDirection === "NONE" ? initialRows : [...rows].sort(comparer);
    };

    return (
        <>
            {
                rows.length &&
                    labels.length ?
                    <div className="remarks">
                        {
                            remarkTypes.map(type => {
                                const filteredRows = rows.filter(r => r['Type'] === type)
                                return <Panel header={type} collapsible defaultExpanded={true}>
                                    <DataGrid
                                        columns={labels.map(label => {
                                            return {
                                                ...label,
                                                headerRenderer: ({ column }) => (
                                                    <div className="level">
                                                        <div className="level-left">
                                                            <div className="level-item">
                                                                {column.name}
                                                            </div>
                                                        </div>
                                                        <div className="level-right">
                                                            <div className="level-item">
                                                                {
                                                                    sort.column &&
                                                                        sort.column === column.name ?
                                                                        (
                                                                            sort.direction === 'NONE' ?
                                                                                <FiArrowUp style={{ 'color': '#ccc' }} /> :
                                                                                sort.direction === 'ASC' ?
                                                                                    <FiArrowUp /> :
                                                                                    <FiArrowDown />
                                                                        ) :
                                                                        !['count'].includes(column.key) && <FiArrowUp style={{ 'color': '#ccc' }} />
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        })}
                                        rowGetter={i => ({ count: i + 1, ...filteredRows[i] })}
                                        rowsCount={filteredRows.length}
                                        minColumnWidth={20}
                                        headerRowHeight={35}
                                        rowHeight={50}
                                        minHeight={filteredRows * 50}
                                        onGridSort={(sortColumn, sortDirection) => {
                                            let direction = sortDirection
                                            switch (sort.direction) {
                                                case 'ASC':
                                                    direction = 'DESC'
                                                    break
                                                case 'DESC':
                                                    direction = 'NONE'
                                                    break
                                                case 'NONE':
                                                    direction = 'ASC'
                                                    break
                                                default:
                                                    break
                                            }
                                            setRows(sortRows(initialRows, sortColumn, direction))
                                            setSort(prev => {
                                                return {
                                                    column: sortColumn,
                                                    direction
                                                }
                                            })
                                        }}
                                    />
                                </Panel>
                            })
                        }
                    </div> :
                    <div style={{
                        'width': '100%',
                        'textAlign': 'center',
                        'border': '1px solid #ddd',
                        'padding': 10,
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
