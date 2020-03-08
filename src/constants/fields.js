export const fields = [
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
]

export const readOnlyFields = [
    'GST',
    'Grand Total',
]

export const datetimeFields = [
    'Agreement date & time',
]

export const numberFields = [
    'Unit',
]

export const currencyFields = [
    'GST',
    'Discount',
    'Grand Total',
]

export const options = {
    'CX': 'Companies',
    'CTX': 'Contacts',
    'PX': 'Products',
    'Payments': 'Payments',
    'Install / Maintenance': 'Installation / Maintenance',
    'SX': 'Salespeople',
}

export const identifiers = {
    'CTX': ['Contact details', 'Name'],
    'PX': ['Product', 'Model'],
}

export const computedFields = [
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
]

export const selectFields = [
    'Stage'
]