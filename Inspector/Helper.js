function reduceByProperties(arr, properties) {
    const newArray = [];

    for (let i = 0; i < arr.length; i++) {
        let index = arr[i];
        let isExists = false;

        for (let j = 0; j < newArray.length; j++) {
            const newIndex = newArray[j];
            let equalCount = 0;

            for (let k = 0; k < properties.length; k++) {
                if (newIndex[properties[k]] === index[properties[k]]) {
                    equalCount++;
                }
            }

            if (equalCount === properties.length) {
                isExists = true;
                break;
            }
        }

        if (!isExists) {
            newArray.push(arr[i]);
        }
    }
    return newArray;
}

function filterProperties(arr, properties) {
    return arr.map(index => {
        const obj = {};
        for (const prop in index) {
            if (properties.includes(prop)) {
                obj[prop] = index[prop];
            }
        }
        return obj;
    });
}

module.exports = {
    reduceByProperties,
    filterProperties
}
