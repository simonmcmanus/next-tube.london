
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

        if(keys[id] && keys[id].length > 0) {
            if(typeof arr[keys[id][0]][field] === 'string') {
                arr[keys[id][0]][field] = [arr[keys[id][0]][field]];
            }

            if(typeof arr[pos][field] === 'string') {
                arr[pos][field] = [arr[pos][field]];
            }

            if(pos !== keys[id][0]) {
                Array.prototype.push.apply(arr[keys[id][0]][field], arr[pos][field]);
                delete arr[pos];
            }
        }
        return  arr;
    }, []).filter(function(item) {
        return (typeof item.id !== 'undefined');
    });
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
