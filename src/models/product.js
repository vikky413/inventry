const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const productSchema = new Schema({

    file : {
        type:String,
        required:true,
    },
    pname : {
        type:String,
        required:true,
    },
    cat : {
        type:String,
        required:true
    },
    price : {
        type:Number,
        required:true
    },
   pmdate : {
    type : String,
    required:true
   },
   pxdate : {
    type : String,
    required:true
   },
   descr : {
    type :String
   },
   pid : {
    type:Number,
    required:true
   }
});

// Compile model from schema
const Product = mongoose.model("productModel", productSchema);
module.exports = Product