export const fields = {
    'Appointments': [
        'ENABLE_BLOCKS',
        {
            name: '',
            fields: [
                'CX',
                'Appointment name',
                'Name',
                'Contact',
                'Customer company',
                'Email',
                'DOB',
                'Address',
                'House Unit',
                'Postal Code',
                'Zone',
                'Name 2',
                'Contact 2',
                'Relationship',
                'Creator'
            ]
        },
        {
            name: 'Appointment details',
            fields: [
                'Source',
                'Assign to',
                'Stage',
                'Appointment date & time',
                'AG no.',
                'Agreement date & time',
            ]
        },
        {
            name: 'Product',
            fields: [
                'PX',
                'Unit',
                'Price',
                'Discount',
                'GST',
                'Grand Total',
            ]
        },
    ],
    'Products': [
        'Model',
        'Color',
        'Price',
        'Commission (sales)',
        'Commission (install)'
    ],
    'Maintenance': [
        'Name',
        'Job',
        'Unit',
        'Date & Time',
        'Amount',
        'Mode',
        'Remarks',
        'Status'
    ],
    'Payments': [
        'ID',
        'Payment Mode',
        'Amount',
        'Date',
        'Bank',
        'Detail',
        'Total',
        'Total paid',
        'Outstanding',
        'Remarks',
        'Payment Status'
    ]
}

export const hiddenFields = [
    'Creator'
]

export const readOnlyFields = [
    'Subtotal',
    'GST',
    'Grand Total',
    'Price',
    'Zone'
]

export const datetimeFields = [
    'Appointment date & time',
    'Agreement date & time',
    'Date & Time',
]

export const dateFields = [
    'DOB',
]

export const numberFields = [
    'Unit',
    'Postal Code'
]

export const currencyFields = [
    'GST',
    'Discount',
    'Grand Total',
    'Subtotal',
    'Outstanding',
    'Total paid',
    'Price',
    'Commission (sales)',
    'Commission (install)',
    'Amount',
]

export const options = {
    'CX': 'Companies',
    'PX': 'Products',
    'Payments': 'Payments',
    'Install / Maintenance': 'Maintenance',
    'SX': 'Salespeople',
}

export const identifiers = {
    'PX': ['Product', 'Model'],
    'CX': ['Company', 'Company'],
}

export const computedFields = {
    'Appointments': [
        'Price',
        'GST',
        'Grand Total',
        'Total paid',
        'Outstanding',
        'Salesperson',
        'Product link',
        'Fresh',
        'Company',
        'Product'
    ],
    'Payments': [
        'Total',
        'Total paid',
        'Outstanding'
    ]
}

export const selectFields = [
    'Stage',
    'Status',
    'Job',
    'Payment Mode',
    'Payment Status',
    'Source',
    'Assign to'
]