require('dotenv').config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = socketIo(server);

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const bodyParser = require("body-parser");

var Web3 = require("web3");

const abi = require('../client/src/abi');
//const web3 = new Web3(new Web3.providers.HttpProvider(`https://rinkeby.infura.io/${process.env.INFURA_ACCESS_TOKEN}`));
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const INITVAL = 3;
const tokenAddress = process.env.TOKEN_ADDRESS;
console.log(tokenAddress);
web3.eth.defaultAccount = process.env.WALLET_ADDRESS;
console.log(process.env.INFURA_ACCESS_TOKEN);
console.log(`Dflt Acc 3: ${process.env.WALLET_ADDRESS}`);
console.log(`Dflt Acc 4: ${web3.eth.defaultAccount}`);
const sender = web3.eth.defaultAccount;
const contract = new web3.eth.Contract(abi, process.env.CONTRACT_ADDRESS);
const bankID = 0;

// -------------------------
// Socket.io integration

let messages = [];

io.on('connection', function(socket) {

    socket.emit('getMsgs', messages);

    socket.on('chatMsg', msg => {
        messages = [].concat(messages, msg);
        socket.broadcast.emit('newChatMsg', msg);
    });

});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/uploads");
  },
  filename: (req, file, cb) => {
    let name = Date.now() + path.extname(file.originalname);
    //UUID V1 to generate cryptographically unique timestamped strings
    console.log(`REQQQQ ${name}`);
    cb(null, name);
  },
});
var upload = multer({
  storage: storage,
  limits: { fileSize: 25000000 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      return cb(new Error("Only png, jpg and jpeg are allowed"));
    }
  },
  onError: function (err, next) {
    console.log("error", err);
    next(err);
  },
});
app.use("/static", express.static("server/uploads"));

const corsOptions = {
  credentials: true, // This is important.
  origin: (origin, callback) => {
    if(['http://localhost:8000', undefined].includes(origin))
      return callback(null, true);
      callback(new Error('Not allowed by CORS'));
  }
}
app.use(require("cors")(corsOptions));

const mongoose = require("mongoose");
const dbUri = process.env.MONGODB || "mongodb://localhost/amoreal";
const PORT = process.env.PORT || 3000;
const dbOptions = {
  promiseLibrary: require("bluebird"),
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

const db = mongoose.createConnection(dbUri, dbOptions);

const User = require("./models/user")(db);

//----Seed----
const seed = () => {
  const users = [
    {
      email: "alfred@example.com",
      displayName: "Alfred",
      password: "321321",
      gender: "Male",
      preference: "Female",
      scores: {},
      avatars: ["Alfred.png"],
      balance: 3,
    },
    {
      email: "bill@example.com",
      displayName: "Bill",
      password: "321321",
      gender: "Male",
      preference: "Female",
      scores: {},
      avatars: ["Bill.png"],
      balance: 3,
    },
    {
      email: "claire@example.com",
      displayName: "Claire",
      password: "321321",
      gender: "Female",
      preference: "Male",
      scores: {},
      avatars: ["Claire.png"],
      balance: 3,
    },
    {
      email: "david@example.com",
      displayName: "David",
      password: "321321",
      gender: "Male",
      preference: "Female",
      scores: {},
      avatars: ["David.png"],
      balance: 3,
    },
    {
      email: "maria@example.com",
      displayName: "Maria",
      password: "321321",
      gender: "Female",
      preference: "Male",
      scores: {},
      avatars: ["Maria.png"],
      balance: 3,
    },
  ];

  User.deleteMany({})
    .then(() => {
      User.create(users)
        .then((seeds, err) => {
          const [alfred, bill, claire, david, maria] = seeds;

          alfred.scores = {
            [claire._id]: 1,
          };

          bill.scores = {
            [claire._id]: 1,
          };

          david.scores = {
            [claire._id]: 1,
            [maria._id]: 1,
          };

          claire.scores = {
            [alfred._id]: 1,
          };

          alfred.save();
          bill.save();
          david.save();
          claire.save();
          console.log(`MONGODB SEED: ${seeds.length} Users created.`);
        })
        .catch((err1) => {
          console.log(`${err1} SEED FAILED`);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
db.on("open", () => {
  seed();
});

//----Passport----

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const auth = require("./auth.js");

app.use(passport.initialize());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    function (email, password, done) {
      //NOT ERRORING CORRECTLY
      User.findOne({ email }, function (err, user) {
        console.log("User is: ", user);
        if (err) {
          console.error("Auth error: " + err);
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      });
    }
  )
);

app.post(
  "/auth/login",
  passport.authenticate("local", { session: false }),
  ({ user }, res) => {
    let access_token = auth.sign(user);
    res.json({ access_token });
  }
);

app.post("/auth/signup", (req, res, next) => {
  // 1. Find user given Email
  // 2. If present, deny
  // 3. Else, create
  let user = req.body;
  var acTokUser;
  const txData = {
    from: sender,
    gasLimit: 3000000,
  };
  User.find({ email: user.email }).then((users) => {
    if (users.length == 0) {
      const newUser = new User(user);
      newUser
        .save()
        .then((user_, _) => {
          acTokUser = user_;
          console.log("new user succeeded for" + user_);
          User.findOne({ email: user.email })
            .then((userAgain) => {
              console.log(`Retrieved uid: ${userAgain.userID}`);
              const access_token = auth.sign(acTokUser);
              // contract.methods
              //   .createReceiver(userAgain.userID)
              //   .send(txData)
              //   .then((tx01) => {
              //     console.log(tx01);
							//
              //     contract.methods
              //       .sendFundsFromReceiversTo([bankID], tokenAddress, [INITVAL*100], [userAgain.userID])
              //       .send(txData)
              //       .then((tx02) => {
              //         console.log(tx02);
              //         res.json({
              //           access_token: access_token,
              //           userID: userAgain.userID,
              //         });
              //       })
              //       .catch((err) => {
              //         console.log(err);
              //         res.json({
              //           status: 'Err'
              //         });
              //       });
              //   });
            })
            .catch((err1) => {
              console.log(err1);
              res.json({
                status: 'Err1'
              });
            });
        })
        .catch(function (err) {
          console.log(err);
          res.json({
            status: 'Err?'
          });
        });
    } else {
      res.json({
        status: "Error",
        message: "User with such email exists",
      });
    }
  });
});

app.post("/foto", upload.single("img"), (req, res) => {
  let filepath = req.file.path.split("/").pop();
  console.log(`${req.body.email} just uploaded ${filepath}`);
  User.updateOne({ _id: req.body._id }, { $set: { avatars: [filepath] } })
    .then((user) => {
      res.json({ filepath });
    })
    .catch(function (err) {
      console.log(err);
    });
});

const isAuthenticated = auth.isAuthenticated(User);
// -------------------------
// Basic routes
// todo: need this?

app.get("/", function (req, res) {
  User.find({}, (err, users) => {
    res.json(users);
  });
});

app.get("/peeps", function (req, res) {
  User.find({}, (err, users) => {
    //console.log(`Users = ${users}`);
    res.json(users);
  });
});

app.get("/protected", isAuthenticated, function (req, res) {
  res.send("Authenticated!");
});

app.use("/api", require("./api")(db, isAuthenticated, web3));

// app.post("/transfer", (req, res) => {
//   let transfer = req.body;
//   console.log(transfer);
//   User.findOne({ email: transfer.recipientEmail }).then((user) => {
//     if (!user) {
//       res.json({
//         status: "Error",
//         message: "No such recipient.",
//       });
//     } else {
//       user.balance = user.balance + parseInt(transfer.amount);
//
//       User.findOne({ email: transfer.email }).then((user2) => {
//         if (!user2) {
//           res.json({
//             status: "Error",
//             message: "No such sender.",
//           });
//         } else {
//           user2.balance = user2.balance - transfer.amount;
//           user.save();
//           user2.save();
//           res.json({ status: "success", from: user2.userID, to: user.userID });
//         }
//       });
//     }
//   });
//
//   console.log("Transfer Completed.");
// });

//------
app.use((err, req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8000");
  res.header('Access-Control-Allow-Credentials', true);
  res.status(err.status || 500);
	res.header("Access-Control-Allow-Origin", "http://localhost:8000");
  res.header('Access-Control-Allow-Credentials', true);
  res.json({
    error: {
      message: err.message,
      error: err,
    },
  });
  next();
});

// the __dirname is the current directory from where the script is running

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(__dirname)); // BUILD NAME
	app.get('*', (req, res) => {
		res.sendFile(path.join(__dirname, '../client/dist/app/index.html'))
	});
}



server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
