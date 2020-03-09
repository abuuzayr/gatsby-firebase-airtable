export const fields = {
    'Opportunities': [
        'Opportunity name',
        'Stage',
        'CTX',
        'AG no.',
        'Agreement date & time',
        'PX',
        'Unit',
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
    'Contacts': [
        'Name',
        'Company',
        'Phone',
        'Email',
        'DOB',
        'Address',
        'Unit',
        'Postal Code',
        'Zone'
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
]

export const datetimeFields = [
    'Agreement date & time',
    'Date & Time',
]

export const dateFields = [
    'DOB',
]

export const numberFields = [
    'Unit',
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
    'CTX': 'Contacts',
    'PX': 'Products',
    'Payments': 'Payments',
    'Install / Maintenance': 'Maintenance',
    'SX': 'Salespeople',
}

export const identifiers = {
    'CTX': ['Contact details', 'Name'],
    'PX': ['Product', 'Model'],
}

export const computedFields = {
    'Opportunities': [
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
        'Contact details',
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