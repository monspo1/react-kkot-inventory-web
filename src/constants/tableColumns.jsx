import { Box, Button, IconButton, Tooltip, } from '@mui/material';
import moment from 'moment'
import { itemCategoryArr, itemWeightUnitArr } from '../utils/helpers'
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { DatePicker, DateRangePicker } from '@mui/x-date-pickers';

import dayjs from 'dayjs';
import './../styles/variables.scss';

export const columnsForBoxTable = [
    {
        accessorKey: 'box_initial', //access nested data with dot notation
        header: 'Box Initial',
    },
    {
        accessorKey: 'box_creator',
        header: 'Created by',
        Cell: ({ cell }) => cell.getValue()?.email,
    },
    {
        accessorKey: 'items_count',
        header: 'Item Count',
    },
    {
        accessorKey: 'items_weight',
        header: 'Total Weight (lbs)',
    },
    {
        accessorKey: 'items_price',
        header: 'Total Price ($)',
    },
    {
        accessorKey: 'updated', //normal accessorKey
        header: 'Created At',
        Cell: ({ cell }) => moment(cell.getValue()).format('MM/DD/YYYY, HH:MM'),
    },
    
];


export const columnsForMasterTable = [
    {
        accessorKey: 'barcode', //access nested data with dot notation
        header: 'Barcode',
        filterFn: 'includesString',
        size: 100,
    },
    {
        accessorKey: 'brand',
        header: 'Brand',
        filterFn: 'includesString',
        size: 100,
    },
    {
        accessorKey: 'content', //normal accessorKey
        header: 'Content',
        filterFn: 'includesString',
        size: 200,
    },
    {
        id: 'updated_at',
        header: 'Updated',
        filterVariant: 'date-range',
        accessorFn: (originalRow) => {
            // console.log('date: ', originalRow.updated_at, " | moment: ", moment(originalRow.updated_at).toDate())
            return moment.utc(originalRow.updated_at).toDate()
        },
        Cell: ({ cell }) => {
            const date = cell.getValue();
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const seconds = date.getUTCSeconds();
            const ampm = hours < 12 ? 'AM' : 'PM';
            const adjustedHours = hours % 12 || 12;  // 0(12 AM)을 12로 변환
            return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}, ${adjustedHours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds} ${ampm}`;
        },
    },
    {
        accessorKey: 'item_weight_oz',
        header: 'Unit (oz)',
        filterFn: 'includesString',
        size: 80,
    },
    {
        accessorKey: 'item_weight_g',
        header: 'Unit (g)',
        filterFn: 'includesString',
        size: 80,
    },
    {
        accessorKey: 'item_weight_lbs',
        header: 'Unit (lbs)',
        filterFn: 'includesString',
        size: 80,
    },
    {
        accessorKey: 'item_price',
        header: 'Unit ($)',
        filterFn: 'includesString',
        size: 80,
    },
    {
        accessorKey: 'category',
        header: 'Category',
        // filterFn: 'equals',
        // filterVariant: 'select',
        // filterSelectOptions: ['Clothing/Shoes', 'Cans/Glasses', ... ],  // <=  수정
        size: 150,
    },
    {
        accessorKey: 'is_reviewed',
        header: 'Reviewed??',
        size: 50,
        Cell: ({ cell }) => cell.getValue()? 'Yes' : 'No',
        filterFn: 'customYesNoFilterFn',
    },
    {
        accessorKey: 'review_reason',
        header: 'Reason',
        size: 50,
        // Cell: ({ cell }) => cell.getValue(),
        filterFn: 'includesString',
    },
];

export const columnsForBoxItemsTable = [
    {
        accessorKey: 'barcode', 
        header: 'Barcode',
        Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
        size: 100,
    },
    {
        accessorKey: 'brand',
        header: 'Brand',
        Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
        size: 100,
    },
    {
        accessorKey: 'content',
        header: 'Content',
        Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
        size: 200,
    },
    // {
    //     accessorKey: 'item_weight_oz',
    //     header: 'Unit (oz)',
    //     size: 80,
    // },
    // {
    //     accessorKey: 'item_weight_g',
    //     header: 'Unit (g)',
    //     size: 80,
    // },
    // {
    //     accessorKey: 'item_weight_lbs',
    //     header: 'Unit (lbs)',
    //     size: 80,
    // },
    {
        accessorKey: 'item_weight',
        header: 'Weight',
        Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
        size: 80,
    },
    {
        accessorKey: 'weight_unit',
        header: 'Weight Unit',
        editVariant: 'select',
        editSelectOptions: itemWeightUnitArr,
        Cell: ({ cell }) =>  cell.getValue(),
        muiEditTextFieldProps: {
          select: true,
        },
        size: 150,
    },
    {
        accessorKey: 'item_price',
        header: 'Unit ($)',
        size: 80,
    },
    {
        accessorKey: 'category',
        header: 'Category',
        editVariant: 'select',
        editSelectOptions: itemCategoryArr,
        Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
        Cell: ({ cell }) =>  cell.getValue(),
        muiEditTextFieldProps: {
          select: true,
        //   error: !!validationErrors?.state,
        //   helperText: validationErrors?.state,
        },
        size: 150,
    },
    /*
    {
        accessorKey: 'item_expiration', //normal accessorKey
        header: 'Expiration',
        Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
        size: 180,
        // Cell: ({ row, cell }) => {
        //     // console.log('cell.getValue(): ', cell.getValue(), " | cell.value", cell.value )
        //     // console.log('row: ', row, ' | cell: ', cell)
        //     const dateValue = dayjs(cell.value);
        //     return <div>{dateValue.format('MM/DD/YYYY')}</div>
        //     // return <DatePicker label="" defaultValue={dayjs()} />
        // },
        // Cell: ({ cell }) => {
        //     console.log('cell.getValue(): ', cell.getValue(), " | cell.value", cell.value )
        //     const dateValue = dayjs(cell.getValue());
        //     return <DatePicker label="" defaultValue={dateValue} />
        // },
        // Cell: ({ cell, row, table }) => {
        //     console.log('editingRow: ', editingRow, " | cell.row.index: ", cell.row.index)
        //     const dateValue = dayjs(cell.value);
        //     return editingRow === cell.row.index ? 
        //       <DatePicker label="" defaultValue={dateValue} /> :
        //       <div>{dateValue.format('MM/DD/YYYY')}</div>
        //   },
        Cell: ({ cell, row }) => {
            const value = cell.getValue();
            // console.log('date value: ', value)
            let date;
            if (value.includes('-')) {
                date = moment(value, moment.ISO_8601);
            } else {
                date = moment(value, 'MM/DD/YYYY');
            }
            return date.isValid() ? date.format('MM/DD/YYYY, HH:mm') : 'Invalid date';
        },
        // muiTableBodyCellProps: ({cell}) => { // !!!seems not working!!!
        //     const value = cell.getValue();
        //     let date;
        //     if (value.includes('-')) {
        //         date = moment(value, moment.ISO_8601);
        //     } else {
        //         date = moment(value, 'MM/DD/YYYY');
        //     }
        //     const expirationCutTime = moment().add(1, 'years');
        //     return {
        //         sx: {
        //             backgroundColor: (value === '' || (date.isValid() && date.isBefore(expirationCutTime))) ? '#f47f7f80' : undefined,                    
        //         }
        //     }
        // }
    },
    //*/
    {
        accessorKey: 'item_expiration',
        header: 'Date',
        enableEditing: false,
        Cell: ({ cell }) => {
            // console.log('cell.getValue(): ', cell.getValue(), " | cell.value", cell.value )
            const dateValue = dayjs(cell.getValue());
            return <DatePicker label="" defaultValue={dateValue} slotProps={{ textField: { size: 'small' } }} />
        },
    },
    {
        accessorKey: 'item_count',
        header: 'Count',
        Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
        size: 80,
    },
]
