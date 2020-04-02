import React from 'react'
import { FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { datetimeFields } from '../constants/fields'

export const sortRows = (initialRows, sortColumn, sortDirection) => rows => {
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

export const HeaderWithSorting = ({ column, sort }) => (
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
                        column.sortable && <FiArrowUp style={{ 'color': '#ccc' }} />
                }
            </div>
        </div>
    </div>
)

export const onGridSort = (sortColumn, sortDirection, initialRows, setRows, sort, setSort) => {
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
}

export const prioritySort = (a, b) => {
    const A = a['Priority']
    const B = b['Priority']
    if (!A && !B) return 0
    if (A && !B) return -1
    if (!A && B) return 1
    if (parseInt(A) < parseInt(B)) return -1
    if (parseInt(A) > parseInt(B)) return 1
    return 0
}