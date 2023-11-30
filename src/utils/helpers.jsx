import moment from 'moment'

export const convertStringNonUndefinedToNumber = (row, target) => {
    // if(isNaN(Number(value))) return undefined;
    if(row['unit_oz'] === undefined || row['unit_oz'] === "" || isNaN(row['unit_oz'])) return "";

    switch (target) {
        // r['unit_oz'] = (r['unit_lbs'] !== undefined) ? r['unit_lbs'] * 16 : (r['unit_g'] !== undefined) ? r['unit_g'] * 0.035274 : r['unit_g'];
        case 'unit_lbs': 
            if(row[target] === undefined) row[target] = row['unit_oz'] * 0.0625;
            else if(row[target] === "") row[target] = "";
            break;
        case 'unit_g': 
            if(row[target] === undefined) row[target] = row['unit_oz'] * 0.0022;
            else if(row[target] === "") row[target] = "";
            break;
    }
    return Number(Number(row[target]).toFixed(2));
}

export const getUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export const getRandomTestDate = () => {
    // 한 달 전의 날짜를 구합니다.
    const oneMonthAgo = moment().subtract(1, 'months');
  
    // 한 달 전부터 현재까지의 랜덤한 날짜를 구합니다.
    const randomDate = oneMonthAgo.add(Math.random() * moment().diff(oneMonthAgo), 'milliseconds');
 
    return randomDate.toISOString()
}

export const itemCategoryArr = [
    { label: 'Cans / Glasses', value: 'option1', example: "Ex) 캔 음식, 보존 음식류, ..." },
    { label: 'Clothing / Shoes', value: 'option2', example: "Ex) 의류, 천, 신발류, ..." },
    { label: 'Diaper / Pads / Etc', value: 'option3', example: "Ex) 기저귀, 패드, 환자용 깔개, ..." },
    { label: 'Flours', value: 'option4', example: "Ex) 가루로 된 것, 밀가루, 옥수수가루, 녹말가루, ..." },
    { label: 'Furniture', value: 'option5', example: "Ex) 의자, 데스크, ...." },
    { label: 'Grains / Cereals', value: 'option6', example: "Ex) 쌀, 콩, 잡곡, 시리얼, ..." },
    { label: 'Medical Supplies', value: 'option7', example: "Ex) 의약품, 의료용품, 의료기구, ..." },
    { label: 'Necessities / Coffee', value: 'option8', example: "Ex) 설탕, 소금, 소스, 양념, 숩, 커피, ..." },
    { label: 'Others', value: 'option9', example: "Ex) 기타용품, 장난감, 우산, ...." },
    { label: 'Pastas / Noodles', value: 'option10', example: "Ex) 파스타, 스파게티, 라면, 국수, ..." },
    { label: 'Snacks / Juice', value: 'option11', example: "Ex) 쿠키, 초콜렛, 캔디, 쥬스, 음료, ..." },
];