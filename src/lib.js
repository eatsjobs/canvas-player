/**
 * extend: this function merge two objects in a new one with the properties of both
 *
 * @alias module:src/lib.extend
 * @param {Object} o1 -
 * @param {Object} o2 -
 * @returns {Object} a brand new object results of the merging
 * */
function extend(o1, o2){

    var isObject = Object.prototype.toString.apply({});
    if((o1.toString() !== isObject) || (o2.toString() !== isObject)) {
        throw new Error("Cannot merge different type");
    }
    var newObject = {};
    for (var k in o1){
        if(o1.hasOwnProperty(k)){
            newObject[k] = o1[k];
        }
    }

    for (var j in o2) {
        if(o2.hasOwnProperty(j)){
            newObject[j] = o2[j];
        }
    }
    return newObject;
}


/**
 * Iterator
 *
 * @alias module:src/lib.Iterator
 * @example
 * var myArray = ["pippo", "pluto", "paperino"];
 * var it = lib.Iterator(myArray);
 * it.next().value === "pippo"; //true
 * it.next().value === "pluto"; //true
 * it.next(true).value === "paperino" //false because with true you can reset it!
 * @param {Array} array - the array you want to transform in iterator
 * @returns {Object} - an iterator-like object
 * */
function Iterator(array){
    var nextIndex = 0;

    return {
        next: function(reset){
            if(reset){nextIndex = 0;}
            return nextIndex < array.length ?
            {value: array[nextIndex++], done: false} :
            {done: true};
        }
    };
}

module.exports = {
    extend:extend,
    Iterator:Iterator
}