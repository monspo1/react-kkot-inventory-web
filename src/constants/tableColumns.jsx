import moment from 'moment'

export const columnsForBoxTable = [
    {
        accessorKey: 'box_initial', //access nested data with dot notation
        header: 'Initial',
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
        header: 'Item Weight',
        // size: 150,
    },
    {
        accessorKey: 'items_price',
        header: 'Item Price',
        // size: 150,
    },
    {
        accessorKey: 'updated', //normal accessorKey
        header: 'Created At',
        // size: 150,
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
        // filterSelectOptions: ['Clothing / Shoes', 'Cans/Glasses', ... ],  // <=  수정
        size: 150,
    },
    // { label: 'Cans/Glasses', value: 'option1', example: "Ex) 캔 음식, 보존 음식류, ..." },
    // { label: 'Clothing / Shoes', value: 'option2', example: "Ex) 의류, 천, 신발류, ..." },
    // { label: 'Diaper / Pads / Etc', value: 'option3', example: "Ex) 기저귀, 패드, 환자용 깔개, ..." },
    // { label: 'Flours', value: 'option4', example: "Ex) 가루로 된 것, 밀가루, 옥수수가루, 녹말가루, ..." },
    // { label: 'Furniture', value: 'option5', example: "Ex) 의자, 데스크, ...." },
    // { label: 'Grains / Cereals', value: 'option6', example: "Ex) 쌀, 콩, 잡곡, 시리얼, ..." },
    // { label: 'Medical Supplies', value: 'option7', example: "Ex) 의약품, 의료용품, 의료기구, ..." },
    // { label: 'Necessities / Coffee', value: 'option8', example: "Ex) 설탕, 소금, 소스, 양념, 숩, 커피, ..." },
    // { label: 'Others', value: 'option9', example: "Ex) 기타용품, 장난감, 우산, ...." },
    // { label: 'Pastas / Noodles', value: 'option10', example: "Ex) 파스타, 스파게티, 라면, 국수, ..." },
    // { label: 'Snacks / Juice', value: 'option11', example: "Ex) 쿠키, 초콜렛, 캔디, 쥬스, 음료, ..." },
    {
        accessorKey: 'is_reviewed',
        header: 'Reviewed??',
        size: 50,
        Cell: ({ cell }) => cell.getValue()? 'Yes' : 'No',
        filterFn: 'customYesNoFilterFn',
    },
];
