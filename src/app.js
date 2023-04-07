const express = require("express");
const path = require("path");
const app = express();
// const hbs = require("hbs")
const ejs = require("ejs");
require("./db/connect");
// const userModel = require('./models/student')
const Admin = require("./models/admin");
const Supplier = require("./models/supplier");
const Product = require("./models/product");
const Category = require("./models/category")
const Payment = require("./models/payment")
var jwt = require('jsonwebtoken');
const multer = require("multer");

const port = process.env.PORT || 5000;

const static_path = path.join(__dirname, "../public");
const temp_path = path.join(__dirname, "../templates/views");
// const part_path = path.join(__dirname, "../templates/partials");
// const part_path = path.join(__dirname, "../templates/partial");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "ejs");
app.set("views", temp_path);
// ejs.registerPartials(part_path);

function checkLoginUser(req, res, next) {
  var userToken = localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch (err) {
    res.redirect('/');
  }
  next();
}

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

var Storage = multer.diskStorage({
  destination: "./public/upload/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({
  storage: Storage
}).single('file');


function checkEmail(req, res, next) {
  var email = req.body.email;
  var checkexitemail = Supplier.findOne({ email: email });
  checkexitemail.exec((err, data) => {
    if (err) throw err;
    if (data) {

      return res.render('supplier', { title: 'Inventory Management System', msg: 'Email Already Exit',succ:"" });

    }
    next();
  });
}
function checkEmaila(req, res, next) {
  var email = req.body.email;
  var checkexitemail = Admin.findOne({ email: email });
  checkexitemail.exec((err, data) => {
    if (err) throw err;
    if (data) {

      return res.render('supplier', { title: 'Inventory Management System', msg: 'Email Already Exit',succ:"" });

    }
    next();
  });
}


app.post("/slogin",async (req, res) => {
  const documentCount = await Payment.count({});
  var x = 0;
  const gdata = Payment.find({})
  const bdata = await gdata.exec();
  bdata.forEach(element => {
     if(element.pid == 0){
      x = x + 1;
     }
  })
  console.log("total data ",x)
  var email = req.body.email;
  const password = req.body.password;
  const checkUser = Supplier.findOne({ email:email });
  checkUser.exec((err, data) => {
    if (data == null) {
      res.render('supplier', { title: 'Inventory Management System', msg: "Invalid Username and Password.",succ:'' });
    }
    else {
      if (err) throw err;
      var getUserID = data._id;
      var getPassword = data.password;
      var stid = data.sid;

      console.log(getPassword)
      if (password === getPassword) {
        var token = jwt.sign({ userID: getUserID }, 'loginToken');
        localStorage.setItem('userToken', token);
        localStorage.setItem('loginUser', email);
        if(stid == 0){
          if(x > 1) {
            res.redirect('/supIndex');
          }else {
            res.render("stock")
          }
          
        }
        else {
          res.render('supplier', { title: 'Inventory Management System', msg: "Waiting for Approval",succ:'' });
        }
          

      }
      else {
        res.render('supplier', { title: 'Inventory Management System', msg: "Invalid Username or Password.",succ:'' });
      }
    }
  });
});

app.post("/alogin", (req, res) => {
  var email = req.body.email;
  const password = req.body.password;
  const checkUser = Admin.findOne({ email:email });
  checkUser.exec((err, data) => {
    if (data == null) {
      res.render('admin', { title: 'Inventory Management System', msg: "Invalid Username and Password.",succ:'' });
    }
    else {
      if (err) throw err;
      var getUserID = data._id;
      var getPassword = data.password;
      console.log(getPassword)
      if (password === getPassword) {
        var token = jwt.sign({ userID: getUserID }, 'loginToken');
        localStorage.setItem('userToken', token);
        localStorage.setItem('loginUser', email);
        
          res.redirect('/adIndex');

      }
      else {
        res.render('admin', { title: 'Inventory Management System', msg: "Invalid Username or Password.",succ:'' });
      }
    }
  });
});


app.get("/", (req, res) => {
  res.render("index" ,{ title: "Inventory Management System",msg:'' });
});


// Admin initial
app.get("/admin", (req, res) => {
  res.render("admin", { title: "Inventory Management System",msg:'',succ:'' });
});

app.get("/supplier", (req, res) => {
  res.render("supplier", { title: "Inventory Management System",msg:'',succ:'' });
});
app.get('/payments', (req,res)=> {
  res.render("payments", { title: 'Inventory Management System'})
})

app.get("/supIndex",async (req, res) => {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    const suplier = Supplier.find({})
    const fmodel = Product.find({})
    const smodel = Category.find({})
    const paymodel = Payment.find({})
    const checkUser = Supplier.findOne({ email:loginUser});
    try {
      let twodata = await suplier.exec()
      let fourdata = await fmodel.exec()
      let sixdata = await smodel.exec()
      let paid = await paymodel.exec()
      let ssdata = await checkUser.exec()
      res.render('supIndex', { title: 'Inventory Management System', loginUser: loginUser, supl: twodata, pdata: fourdata, cdata: sixdata,pydata:paid,sups:ssdata });
    }
    catch (err) {
      throw Error();
    }
  }
  else {
    res.redirect('/admin')
  }
});

app.get("/adIndex", async (req, res) => {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    const suplier = Supplier.find({})
    const fmodel = Product.find({})
    const smodel = Category.find({})
    const pmodel = Payment.find({})
    const checkUser = Admin.findOne({ email:loginUser});

    try {
      let twodata = await suplier.exec()
      let fourdata = await fmodel.exec()
      let sixdata = await smodel.exec()
      let pays = await pmodel.exec()
      let udata = await checkUser.exec();
      res.render('adIndex', { title: 'Inventory Management System', loginUser: loginUser, supl: twodata, pdata: fourdata, cdata: sixdata,msg:'',pydata:pays,users:udata });
    }
    catch (err) {
      throw Error();
    }
  }
  else {
    res.redirect('/admin')
  }
   
})
  





// Supplier Signup Page Here
app.post("/ssignup",checkEmail ,function (req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confirmpassword;
  var sid = 1;
  if (password != confpassword) {
    res.render("supplier", {
      title: "Inventory Management System",
      msg: "Password Not Matched",
      succ:""
    });
  } else {
    var userDetails = new Supplier({
      name: name,
      email: email,
      password: password,
      confirmpassword: confpassword,
      sid:sid
    });
    userDetails.save((err, doc) => {
      if (err) throw err;
      res.render("supplier", {
        title: "InventoryManagement System",
        succ: "User Registerd Successfully",
        msg:''
      });
    });
  }
});

// Admin Signup

app.post("/asignup", checkEmail,function (req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confirmpassword;
  
  if (password != confpassword) {
    res.render("admin", {
      title: "Inventory Management System",
      succ:'',
      msg:'Passsword Not Matched'
    });
  } else {
    var userDetails = new Admin({
      name: name,
      email: email,
      password: password,
      confirmpassword: confpassword,
    });
    userDetails.save((err, doc) => {
      if (err) throw err;
      res.render("admin", {
        title: "InventoryManagement System",
        msg: "",
        succ: "User Registerd Successfully",
      });
    });
  }
});



// Add New Product 
app.post("/add-new-product", upload,async function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  const pname = req.body.pname;
  const cat = req.body.cat;
  const price = req.body.price;
  const pmdate = req.body.pmdate;
  const pxdate = req.body.pxdate;
  const descr = req.body.descr;
  const image = req.file.filename;


  const pid = 100;
  // const suplier = Supplier.find({})
  // const fmodel = Product.find({})
  // const smodel = Category.find({})
    try {
      // let twodata = await suplier.exec()
      // let fourdata = await fmodel.exec()
      // let sixdata = await smodel.exec()
     var passcatDetails = new Product ({
    file: image,
    pname:pname,
    cat:cat,
    price:price,
    pmdate:pmdate,
    pxdate:pxdate,
    descr:descr,
    pid:pid,
  });

  passcatDetails.save(function (err, doc) {
    if (err) throw err;
    res.redirect('/supIndex')
    // res.render('supIndex', { title: 'Inventory Management System', success: 'Product category inserted successfully',loginUser: loginUser, supl: twodata, pdata: fourdata, cdata: sixdata });
    // res.render('supIndex', { title: 'Inventory Management System', loginUser: loginUser, errors: '', success: 'Product category inserted successfully',records:data });
  })
}
catch (err) {
  throw Error();
}

})

app.post("/add-new-category", function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  const cate = req.body.cate;
  var passcatDetails = new Category ({
    cate:cate
  });
  // const getPassCat = Category.find({})
  //   getPassCat.exec(function (err, data) {
  passcatDetails.save(function (err, doc) {
    // if (err) throw err;
    res.redirect('/supIndex')
    // res.render('supIndex', { title: 'Restaurant Management System', loginUser: loginUser, errors: '', success: 'Product category inserted successfully',records:data });
  })
})
// })


app.post("/paymentss", function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  const cname = req.body.cname;
  const tid = Math.floor(Math.random() * 10000000);
  const pid = 1;
  var passcatDetails = new Payment ({
    cname:cname,
    tid:tid,
    pid:pid
  });

  const getPassCat = Category.find({})
  const getdata = Product.find({})

   let categ = getPassCat.exec();
   let prod = getdata.exec();

  passcatDetails.save(function (err, doc) {
    if (err) throw err;
    res.redirect('/adIndex')
  })
})



app.get('/buy/delete/:id', checkLoginUser,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  var passcat_id=req.params.id;
  var passdelete= Product.findByIdAndDelete(passcat_id);
  passdelete.exec(function(err){
    if(err) throw err;
    res.redirect('/adIndex');
  });
});

app.get('/sell/edit/:id', function (req, res, next) {
  var id = req.params.id;
  const productid = 0;
  var passdelete = Product.findByIdAndUpdate(id, { pid: productid });
  passdelete.exec(function (err) {
    if (err) throw err;
    res.redirect('/supIndex');
  });
});

app.get('/pay/edit/:id', function (req, res, next) {
  var id = req.params.id;
  const productid = 0;
  var passdelete = Payment.findByIdAndUpdate(id, { pid: productid });
  passdelete.exec(function (err) {
    if (err) throw err;
    res.redirect('/supIndex');
  });
});

app.get('/sells/return/:id',async function (req, res, next) {
  var id = req.params.id;
 
  const productid = 1000;
  var passdelete = Payment.findByIdAndUpdate(id, { pid: productid });
  passdelete.exec(function (err) {
    if (err) throw err;
    res.redirect('/adIndex');
  });
});

app.get('/reject/edit/:id', function (req, res, next) {
  var id = req.params.id;
  const productid = 999;
  var passdelete = Product.findByIdAndUpdate(id, { pid: productid });
  passdelete.exec(function (err) {
    if (err) throw err;
    res.redirect('/supIndex');
  });
});


app.get('/sell/delete/:id', checkLoginUser,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  var passcat_id=req.params.id;
  var passdelete= Product.findByIdAndDelete(passcat_id);
  passdelete.exec(function(err){
    if(err) throw err;
    res.redirect('/supIndex');
  });
});


app.get('/users/edit/:id', function (req, res, next) {
  var id = req.params.id;
  const productid = 0;
  var passdelete = Supplier.findByIdAndUpdate(id, { sid: productid });
  passdelete.exec(function (err) {
    if (err) throw err;
    res.redirect('/adIndex');
  });
});


app.get('/users/delete/:id', checkLoginUser,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  var passcat_id=req.params.id;
  var passdelete= Supplier.findByIdAndDelete(passcat_id);
  passdelete.exec(function(err){
    if(err) throw err;
    res.redirect('/adIndex');
  });
});
app.get('/cat/delete/:id', checkLoginUser,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  var passcat_id=req.params.id;
  var passdelete= Category.findByIdAndDelete(passcat_id);
  passdelete.exec(function(err){
    if(err) throw err;
    res.redirect('/adIndex');
  });
});

app.get('/logout', function (req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`server is running at port no. ${port}`);
});
