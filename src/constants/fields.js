export const fields = {
    'Appointments': [
        'Appointment name',
        'Stage',
        'Appointment date & time',
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
        'AG no.',
        'Agreement date & time',
        'PX',
        'Unit',
        'Price',
        'Discount',
        'GST',
        'Grand Total',
        'Sales remarks',
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

export const readOnlyFields = [
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
}

export const computedFields = {
    'Appointments': [
        'Price',
        'Subtotal',
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
    'Payment Status'
]