import moment from 'moment'

export const columnsForBoxTable = [
    {
        accessorKey: 'box_initial', //access nested data with dot notation
        header: 'Box Initial',
        // size: 150,
    },
    {
        accessorKey: 'box_creator',
        header: 'Creators',
        // size: 150,
    },
    {
        accessorKey: 'items_count',
        header: 'Item Count',
        // size: 150,
    },
    {
        accessorKey: 'items_weight',
        header: 'Total Item Weight (oz)',
        // size: 150,
    },
    {
        accessorKey: 'items_price',
        header: 'Total Item Price ($)',
        // size: 150,
    },
    {
        accessorKey: 'updated', //normal accessorKey
        header: 'Created At',
        // size: 150,
        Cell: ({ cell }) => moment(cell.getValue()).format('MM/DD/YYYY HH:MM:SS'),
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
