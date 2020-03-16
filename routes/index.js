var express = require('express');
var router = express.Router();
var User = require('../models/user');
var prod_purchase = require('../models/product_purchase')

/////
const bodyParser = require('body-parser')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const stores = ['AM:PM', 'Shufersal', 'Osher Ad', 'Mega Bair']

/////


router.get('/', function (req, res, next) {
	return res.render('index.ejs');
});


router.post('/', function(req, res, next) {
	console.log(req.body);
	var personInfo = req.body;


	if(!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({email:personInfo.email},function(err,data){
				if(!data){
					var c;
					User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}

						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({_id: -1}).limit(1);
					res.send({"Success":"You are regestered,You can login now."});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

router.post('/login', function (req, res, next) {
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		if(data){
			
			if(data.password==req.body.password){
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				res.send({"Success":"Success!"});
				
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			return res.render('data.ejs', {"name":data.username,"email":data.email});
		}
	});
});

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

////////Save memory allocate

var dir = path.join(__dirname, 'serverUploadFiles');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // making uploading dir if not exist
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname)
    }
  })
   
var upload = multer({ storage : storage })



router.get('/upload', function (req, res, next) {
    return res.render('addrecipet');
});



////////////////////////////////////////////////////////

class Recipt {
    constructor(id, name, date, gros) {
        this.id = id;
        this.name = name;
        this.date = date;
        var groceries = []
        gros.forEach(myFunction)

        function myFunction(item) {
            groceries.push(new grocerie(item.product_name, item.price))
        }
        this.gros = groceries;
    }

}

class grocerie {
    constructor(product_name, price) {
        this.product_name = product_name;
        this.price = price;
    }

}




let parseToJson = (filePath, type) => {
    //var fixPath = filePath.replace('/home/saimon9852', process.env.HOME);
    var fullPath = filePath+ '/' + type
    console.log(fullPath)
    if (type.toLowerCase().indexOf('.csv') > 0)
        return parseCsvFile(fullPath)

    if (type.toLowerCase().indexOf('.xml') > 0)
        return parseXmlFile(fullPath)

    if (type.toLowerCase().indexOf('.json') > 0)
        return parseJsonFile(fullPath)

    console.log("--------- ERROR: file type isnt recognized ! ---------")
    dialog.info('file type must be json/xml/csv !');

    return false
}

let parseJsonFile = (filepath) => {
    let file = fs.readFileSync(filepath, 'utf8')
    let recipt = JSON.parse(file)
    var recipts = []
    recipt.forEach(myFunction)

    function myFunction(item) {
        recipts.push(new Recipt(item.id, item.name, item.date, item.gros))
    }
    return recipts
}

let parseXmlFile = (filepath) => {
    let file = fs.readFileSync(filepath, 'utf8')
    let recipt = xmlToJson.xml2json(file, { compact: true, spaces: 4 })
    var recipts = []
    recipt.forEach(myFunction)

    function myFunction(item) {
        recipts.push(new Recipt(item.id, item.name, item.date, item.gros))
    }
    return recipts
}

let parseCsvFile = async (filepath) => {

    let fullRecipt = await csvToJson().fromFile(filepath)
    const recipt = await Promise.all(fullRecipt)
    var recipts = []
    recipt.forEach(myFunction)

    function myFunction(item) {
        recipts.push(new Recipt(item.id, item.name, item.date, item.gros))
    }
    return recipts
}
///////////////////////////////////////////////////////////

const redis = require('redis');


// Create Redis Client
let client = redis.createClient();

client.on('connect', function () {
    console.log('Connected to Redis...');
});


// Uploading multiple files - files are stored in req.files
router.post('/upload', upload.single('myFiles'), (req, res, next) => {
  const files = req.file
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
	
  }

  
var recipets = parseToJson(dir, files.filename);

            if (recipets) {
                recipets.forEach(recipets_Function)
               		
		function recipets_Function(recipet) {
		var prod_list = []; 
		recipet.gros.forEach(function(prod){
			prod_list.push(prod.product_name)
			prod_list.push("product_name")	
			
			prod_purchase.findOne({product_name:prod.product_name,market_name:recipet.name,date:recipet.date,price:prod.price},function(err,data){
					if(!data){

							var newPurchase = new prod_purchase({
								product_name: prod.product_name,
								market_name: recipet.name,
								dateTime: recipet.date,
								price: prod.price,
							});

							newPurchase.save(function(err, Purchase){
								if(err)
									console.log(err);
								else
									console.log('Success');
							});

				}});

				
		});
		groceries_redis_Function(prod_list)
		
                }

		console.log("Done Redis save");

		  function groceries_redis_Function(grocerie) {
                    client.hmset('Products',grocerie, function (err, reply) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    
                }

		//client.hgetall('Products', function(err, result) { console.log(JSON.stringify(result));});
            }
 		
  res.redirect('/profile')
});


///////////////////////////////////////////////////////////////////////////////////////////GRAPH2

router.get('/graph2', function(req, res, next) {
    client.hgetall('Products', function(err, result) {const keys = Object.keys(result); res.render('chooseProd', {'dropdownVals': keys})});	
});


router.post('/graph2', function(req, res, next) {
  let keys = Object.keys(req.body)
  var f_date = req.body.from;
  var s_date = req.body.to;
 
  var fdates = f_date.split('-');
  var first_date = fdates[1] + "/" + fdates[2] + "/" + fdates[0];

  var sdates = s_date.split('-');
  var end_date = sdates[1] + "/" + sdates[2] + "/" + sdates[0];

  startDate = new Date(first_date);
  endDate = new Date(end_date);

  var prod_sel = req.body[keys[2]];
	

   function convert_date_format(holddate){
		splitted = holddate.split(' ');
		return splitted[1] + " " + splitted[2]
    }

  prod_purchase.find({product_name: prod_sel},function(err,data){
	dict_graph = []
  	market_dicts = []
	console.log("///////////////////////////////////////////////////////////////////////////////////////////////////")
	for(var i=0; i < stores.length; i++){
		data_hold = data.filter(function(a){ return a.market_name == stores[i]}); 
		data_hold.sort(function compare(a, b) {
				 var mydatesA = a.dateTime.split('/');
				 var newDateA = mydatesA[1] + "/" + mydatesA[0] + "/" + mydatesA[2];
				 var mydatesB = b.dateTime.split('/');
				 var newDateB = mydatesB[1] + "/" + mydatesB[0] + "/" + mydatesB[2];
 				 var dateA = new Date(newDateA);
 				 var dateB = new Date(newDateB);
  				 return dateA - dateB;
				});
		
		var filteredData = data_hold.filter(function(a){
			var mydates = a.dateTime.split('/');
			var newDate = mydates[1] + "/" + mydates[0] + "/" + mydates[2];
			aDate = new Date(newDate);
			return aDate>= startDate && aDate <= endDate;}); 
		
		var k=0;
		Object.keys(filteredData).forEach(function(v,i){
			var dates_split = filteredData[v].dateTime.split('/');
			var holdate = dates_split[1] + "/" + dates_split[0] + "/" + dates_split[2];
			dict_graph.push({
				label: convert_date_format((new Date(holdate)).toString()),
				y: Number(filteredData[v].price)
			});
		 });

		 

		var seenNames = {};

		dict_graph = dict_graph.filter(function(currentObject) {
		    if (currentObject.label in seenNames) {
			return false;
		    } else {
			seenNames[currentObject.label] = true;
			return true;
		    }
		});



		 market_dicts.push(dict_graph)	
		 dict_graph = []		
	}
	console.log(market_dicts);
	res.send([prod_sel, market_dicts]);		
  });
});


/////////////////////////////////////////////////////////////////////////////////// GRAPH1

router.get('/graph1', function(req, res, next) {
    client.hgetall('Products', function(err, result) {const keys = Object.keys(result); res.render('firstGraph', {'dropdownVals': keys})});	
});


router.post('/graph1', function(req, res, next) {
  let keys = Object.keys(req.body)
  var f_date = req.body.f_from;
  var s_date = req.body.f_to;
  console.log(req.body)
  var fdates = f_date.split('-');
  var first_date = fdates[1] + "/" + fdates[2] + "/" + fdates[0];

  var sdates = s_date.split('-');
  var end_date = sdates[1] + "/" + sdates[2] + "/" + sdates[0];

  startDate = new Date(first_date);
  endDate = new Date(end_date);
  ////
  var f_date2 = req.body.s_from;
  var s_date2 = req.body.s_to;
 
  var fdates2 = f_date2.split('-');
  var first_date2 = fdates2[1] + "/" + fdates2[2] + "/" + fdates2[0];

  var sdates2 = s_date2.split('-');
  var end_date2 = sdates2[1] + "/" + sdates2[2] + "/" + sdates2[0];

  startDate2 = new Date(first_date2);
  endDate2 = new Date(end_date2);

  ///////
  var prod_sel = req.body[keys[4]];
	
  prod_purchase.find({product_name: prod_sel},function(err,data){
	first_date_prices = []
  	second_date_prices = []
	for(var i=0; i < stores.length; i++){
		data_hold = data.filter(function(a){ return a.market_name == stores[i]}); 
		data_hold.sort(function compare(a, b) {
				 var mydatesA = a.dateTime.split('/');
				 var newDateA = mydatesA[1] + "/" + mydatesA[0] + "/" + mydatesA[2];
				 var mydatesB = b.dateTime.split('/');
				 var newDateB = mydatesB[1] + "/" + mydatesB[0] + "/" + mydatesB[2];
 				 var dateA = new Date(newDateA);
 				 var dateB = new Date(newDateB);
  				 return dateA - dateB;
				});
		
		var filteredData1 = data_hold.filter(function(a){
			var mydates = a.dateTime.split('/');
			var newDate = mydates[1] + "/" + mydates[0] + "/" + mydates[2];
			aDate = new Date(newDate);
			return aDate>= startDate && aDate <= endDate;}); 

		var filteredData2 = data_hold.filter(function(a){
			var mydates = a.dateTime.split('/');
			var newDate = mydates[1] + "/" + mydates[0] + "/" + mydates[2];
			aDate = new Date(newDate);
			return aDate>= startDate2 && aDate <= endDate2;}); 

		console.log(filteredData1)
		console.log(filteredData2)

		var count1 = 0;
		var sum1 = 0;
		Object.keys(filteredData1).forEach(function(v,i){
			count1++;
			sum1 = sum1 + Number(filteredData1[v].price)
		 });
		
		var count2 = 0;
		var sum2 = 0;
		Object.keys(filteredData2).forEach(function(v,i){
			count2++;
			sum2 = sum2 + Number(filteredData2[v].price)
		 });
		 console.log(count1, sum1)
		 console.log(count2, sum2)
		 if(count1 != 0 && count2!= 0){
			 first_date_prices.push(sum1/count1);	
			 second_date_prices.push(sum2/count2);
		}
	}
	console.log("------------------------------------------------------------------")
	console.log(first_date_prices, second_date_prices);
	res.send([first_date_prices, second_date_prices, prod_sel]);		
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////// Graph 3 

router.get('/graph3', function(req, res, next) {
    client.hgetall('Products', function(err, result) {const keys = Object.keys(result); res.render('chooseProd', {'dropdownVals': keys})});	
});


router.post('/graph3', function(req, res, next) {
  let keys = Object.keys(req.body)
  var f_date = req.body.from;
  var s_date = req.body.to;
 
  var fdates = f_date.split('-');
  var first_date = fdates[1] + "/" + fdates[2] + "/" + fdates[0];

  var sdates = s_date.split('-');
  var end_date = sdates[1] + "/" + sdates[2] + "/" + sdates[0];

  startDate = new Date(first_date);
  endDate = new Date(end_date);

  var prod_sel = req.body[keys[2]];
	

   function convert_date_format(holddate){
		splitted = holddate.split(' ');
		return splitted[1] + " " + splitted[2]
    }

  prod_purchase.find({product_name: prod_sel},function(err,data){
	dict_graph = []
  	market_dicts = []
	console.log("///////////////////////////////////////////////////////////////////////////////////////////////////")
	for(var i=0; i < stores.length; i++){
		data_hold = data.filter(function(a){ return a.market_name == stores[i]}); 
		data_hold.sort(function compare(a, b) {
				 var mydatesA = a.dateTime.split('/');
				 var newDateA = mydatesA[1] + "/" + mydatesA[0] + "/" + mydatesA[2];
				 var mydatesB = b.dateTime.split('/');
				 var newDateB = mydatesB[1] + "/" + mydatesB[0] + "/" + mydatesB[2];
 				 var dateA = new Date(newDateA);
 				 var dateB = new Date(newDateB);
  				 return dateA - dateB;
				});
		
		var filteredData = data_hold.filter(function(a){
			var mydates = a.dateTime.split('/');
			var newDate = mydates[1] + "/" + mydates[0] + "/" + mydates[2];
			aDate = new Date(newDate);
			return aDate>= startDate && aDate <= endDate;}); 
		
		var k=0;
		Object.keys(filteredData).forEach(function(v,i){
			var dates_split = filteredData[v].dateTime.split('/');
			var holdate = dates_split[1] + "/" + dates_split[0] + "/" + dates_split[2];
			dict_graph.push({
				label: convert_date_format((new Date(holdate)).toString()),
				y: Number(filteredData[v].price)
			});
		 });

		 

		var seenNames = {};

		dict_graph = dict_graph.filter(function(currentObject) {
		    if (currentObject.label in seenNames) {
			return false;
		    } else {
			seenNames[currentObject.label] = true;
			return true;
		    }
		});



		 market_dicts.push(dict_graph)	
		 dict_graph = []		
	}
	console.log(market_dicts);
	res.send([prod_sel, market_dicts]);		
  });
});









module.exports = router;
