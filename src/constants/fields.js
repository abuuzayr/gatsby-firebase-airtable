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
                'Unit #',
                'Postal Code',
                'Zone',
                '2 Name',
                '2 Contact',
                '2 Relationship',
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
                'Total',
                'PX1',
                'Unit1',
                'Price1',
                'Discount1',
                'Total1',
                'PX2',
                'Unit2',
                'Price2',
                'Discount2',
                'Total2',
                'PX3',
                'Unit3',
                'Price3',
                'Discount3',
                'Total3',
                'PX4',
                'Unit4',
                'Price4',
                'Discount4',
                'Total4',
                'PX5',
                'Unit5',
                'Price5',
                'Discount5',
                'Total5',
                'PX6',
                'Unit6',
                'Price6',
                'Discount6',
                'Total6',
                'PX7',
                'Unit7',
                'Price7',
                'Discount7',
                'Total7',
                'PX8',
                'Unit8',
                'Price8',
                'Discount8',
                'Total8',
                'PX9',
                'Unit9',
                'Price9',
                'Discount9',
                'Total9',
                'Subtotal',
                'GST',
                'Grand Total',
            ]
        },
        {
            name: 'Payment',
            prefix: true,
            mode: 'New',
            fields: [
                'ID',
                'Payment Mode',
                'Amount',
                'Date',
                'Bank',
                'Detail',
                'Payment Status'
            ]
        },
        {
            name: 'Installation',
            prefix: true,
            mode: 'New',
            fields: [
                'Job',
                'Unit',
                'Date & Time',
                'Amount to collect',
                'Mode',
            ]
        },
    ],
    'Products': [
        'Model',
        'Priority',
        'Color',
        'Price',
        'Commission (sales)',
        'Commission (install)'
    ],
    'Maintenance': [
        'Name',
        'Job',
        'Date & Time',
        'Amount to collect',
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
        'Payment Status'
    ],
    'Remarks': [
    ]
}

export const hiddenFields = [
    'Creator',
    'Timestamp'
]

export const readOnlyFields = [
    'Subtotal',
    'GST',
    'Grand Total',
    'Total Price',
    'Zone',
    'Total',
    'Total1',
    'Total2',
    'Total3',
    'Total4',
    'Total5',
    'Total6',
    'Total7',
    'Total8',
    'Total9',
]

export const datetimeFields = [
    'Appointment date & time',
    'Agreement date & time',
    'Date & Time',
]

export const dateFields = [
    'DOB',
    'Date',
    'Payment---Date'
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
    'Postal Code',
    'Priority'
]

export const currencyFields = [
    'GST',
    'Discount',
    'Discount1',
    'Discount2',
    'Discount3',
    'Discount4',
    'Discount5',
    'Discount6',
    'Discount7',
    'Discount8',
    'Discount9',
    'Total',
    'Total1',
    'Total2',
    'Total3',
    'Total4',
    'Total5',
    'Total6',
    'Total7',
    'Total8',
    'Total9',
    'Grand Total',
    'Subtotal',
    'Outstanding',
    'Total paid',
    'Total Price',
    'Price',
    'Price1',
    'Price2',
    'Price3',
    'Price4',
    'Price5',
    'Price6',
    'Price7',
    'Price8',
    'Price9',
    'Commission (sales)',
    'Commission (install)',
    'Amount',
    'Amount to collect',
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
    'Assign to',
    'Type'
]

export const largeFields = [
    // 'Agreement date & time',
    // 'Products',
    // 'Payments',
    // 'Install / Maintenance',
    // 'Email',
    // 'Customer company',
    // 'Address',
    // 'Name',
    // '2 Name',
    // 'Appointment date & time',
    // 'Timestamp'
]

export const booleanFields = [
    'Confirmed'
]