import React from 'react'
import Select from 'react-select'
import { DatePicker } from 'rsuite'
import {
    readOnlyFields,
    datetimeFields,
    dateFields,
    currencyFields,
    options as optionsObj,
    identifiers,
    selectFields,
    hiddenFields
} from '../../constants/fields'

const Field = p => {
    const { field, props, options, updateData, data, getLabel, getInputProps } = p
    const fieldName = field.split('---')[1] || field
    return (
        <div className={hiddenFields.includes(field) ? 'is-hidden' : 'panel-block'}>
            <div className="level-left">
                {
                    Object.keys(identifiers).includes(field) ?
                        identifiers[field][0] : fieldName
                }
            </div>
            {
                ['Edit', 'View', 'New'].includes(props.mode) &&
                ((Object.keys(optionsObj).includes(fieldName) || selectFields.includes(fieldName)) ?
                    <Select
                        menuPortalTarget={document.body}
                        options={options[fieldName]}
                        isLoading={!Object.keys(options).length}
                        styles={{
                            container: provided => ({ ...provided, width: '100%' }),
                            menuPortal: provided => ({
                                ...provided,
                                zIndex: 9999,
                            }),
                            option: provided => ({
                                ...provided,
                                fontSize: 12,
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
                                    label: getLabel(data[fieldName], fieldName)
                                }
                        }
                        isDisabled={
                            !Object.keys(options).length ||
                            (readOnlyFields.includes(fieldName) || props.mode === 'View') ||
                            (fieldName === 'Assign to' && data['Creator'] !== props.user.uid && props.user.roles.ADMIN !== 'ADMIN')
                        }
                    >
                    </Select> :
                    <>
                        {
                            currencyFields.includes(fieldName) && <label style={{ 'marginRight': 10 }}>$</label>
                        }
                        {

                            datetimeFields.includes(fieldName) || dateFields.includes(fieldName) ?
                                <DatePicker
                                    onChange={date => updateData(field, date)}
                                    value={data[field] ? new Date(data[field]) : null}
                                    format={datetimeFields.includes(fieldName) ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"}
                                    ranges={[
                                        {
                                            label: datetimeFields.includes(fieldName) ? "Now" : "Today",
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
                                    {...getInputProps(fieldName, props)}
                                />
                        }
                    </>
                )
            }
        </div>
    )
}

export default Field