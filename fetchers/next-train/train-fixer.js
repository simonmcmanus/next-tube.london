
/**
 * Given an array of objects with an id property, ensures no duplicates and merge the
 *  field containing the difference.
 *
 * var a = [{
        id: 1,
        text: 'one '
    }, {
        id: 2,
        text: 'two '
    }, {
        id: 2,
        text: 'three '
    }
    ]

    var out = fix(a, 'text');

    //out equal:
    [
        { id: 1, text: 'one ' },
        { id: 2, text: [ 'two ', 'three ' ] },
    ]
 * @param  {array} arr     Array of objects with an id property
 * @param  {string} field  Name of the field in the object which contains distinction
 * @return {array}       Duplicates removed and field converted to array.
 */



module.exports = function(arr, field) {
    var keys = getPos(arr);
    return arr.reduceRight(function (returned, item, pos, arr) {
        var id = item.id;

        function strToArr(field) {
            if(typeof field === 'string') {
                return [field];
            } else {
                // could do an object check here.
                return field;
            }
        }

        if(keys[id] && keys[id].length > 0) {
            arr[keys[id][0]][field] = strToArr(arr[keys[id][0]][field]);
            arr[pos][field] = strToArr(arr[pos][field]);

            if(pos !== keys[id][0]) {
                Array.prototype.push.apply(arr[keys[id][0]][field], arr[pos][field]);
                arr.splice(pos, 1);
            }
        }
        return  arr;
    }, []);
};

//reduce test
// create an object of arrays for position for each id.
// 
// [{ id: 'a' }, {id: 'b'}, {id: 'a'}]
// creates
// { 'a: [0,2], 'b': [1]}
var getPos = function(arr) {
    return arr.reduce(function(obj, item, pos) {
        var id = item.id;
        if(!obj[id]) {
            obj[id] = [];
        }
        obj[id].push(pos);
        return obj;
    }, {});
};
