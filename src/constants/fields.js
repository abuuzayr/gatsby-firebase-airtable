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
                'PX1',
                'Unit1',
                'PX2',
                'Unit2',
                'PX3',
                'Unit3',
                'PX4',
                'Unit4',
                'PX5',
                'Unit5',
                'PX6',
                'Unit6',
                'PX7',
                'Unit7',
                'PX8',
                'Unit8',
                'PX9',
                'Unit9',
                'Total Price',
                'Discount',
                'Subtotal',
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
    'Total Price',
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
    'Unit1',
    'Unit2',
    'Unit3',
    'Unit4',
    'Unit5',
    'Unit6',
    'Unit7',
    'Unit8',
    'Unit9',
    'Postal Code'
]

export const currencyFields = [
    'GST',
    'Discount',
    'Grand Total',
    'Subtotal',
    'Outstanding',
    'Total paid',
    'Total Price',
    'Price',
    'Commission (sales)',
    'Commission (install)',
    'Amount',
]

export const options = {
    'CX': 'Companies',
    'PX': 'Products',
    'PX1': 'Products',
    'PX2': 'Products',
    'PX3': 'Products',
    'PX4': 'Products',
    'PX5': 'Products',
    'PX6': 'Products',
    'PX7': 'Products',
    'PX8': 'Products',
    'PX9': 'Products',
    'Payments': 'Payments',
    'Install / Maintenance': 'Maintenance',
    'SX': 'Salespeople',
}

export const identifiers = {
    'PX': ['Product 1', 'Model'],
    'PX1': ['Product 2', 'Model'],
    'PX2': ['Product 3', 'Model'],
    'PX3': ['Product 4', 'Model'],
    'PX4': ['Product 5', 'Model'],
    'PX5': ['Product 6', 'Model'],
    'PX6': ['Product 7', 'Model'],
    'PX7': ['Product 8', 'Model'],
    'PX8': ['Product 9', 'Model'],
    'PX9': ['Product 10', 'Model'],
    'Unit': ['Unit'],
    'Unit1': ['Unit'],
    'Unit2': ['Unit'],
    'Unit3': ['Unit'],
    'Unit4': ['Unit'],
    'Unit5': ['Unit'],
    'Unit6': ['Unit'],
    'Unit7': ['Unit'],
    'Unit8': ['Unit'],
    'Unit9': ['Unit'],
    'CX': ['Company', 'Company'],
}

export const computedFields = {
    'Appointments': [
        'GST',
        'Grand Total',
        'Total paid',
        'Outstanding',
        'Salesperson',
        'Product link',
        'Fresh',
        'Company',
        'Product',
        'Products'
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