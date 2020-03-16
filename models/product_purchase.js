var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const purchaseSchema = new Schema( {
	product_name: String,
	market_name: String,
	dateTime: String,
	price: String,
}),
purch = mongoose.model('Purchase', purchaseSchema);

module.exports = purch;
