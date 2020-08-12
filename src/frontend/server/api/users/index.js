require("dotenv").config();
const express = require("express");
const router = express.Router();

const abi = require("../../../client/src/abi");

const bankID = 0;
const contractAddress = process.env.CONTRACT_ADDRESS; // Factory Contract Address
const tokenAddress = process.env.TOKEN_ADDRESS; // Token Contract Address

module.exports = (isAuthenticated, db, web3) => {
  //console.log(web3);
  //web3.eth.defaultAccount = process.env.WALLET_ADDRESS;
  console.log(`Dflt Acc 1: ${process.env.WALLET_ADDRESS}`);
  console.log(`Dflt Acc 2: ${web3.eth.defaultAccount}`);
  const sender = web3.eth.defaultAccount; // Main Account
  const contract = new web3.eth.Contract(abi, contractAddress);

  const User = require("../../models/user")(db);

  var scheduler = require("node-schedule");
  var j = scheduler.scheduleJob("35 41 15 * * *", function () {
    console.log("Midnight Refill");

    let val = 3;

    const txData = {
      from: sender,
      gasLimit: 3000000,
    };

    User.aggregate([
      {
        $match: {
          balance: { $lt: val },
        },
      },
    ])
      .then((users) => {
        users.forEach((user) => {
          console.log(`Updating User ${user.displayName}`);
          User.updateOne({ _id: user._id }, { $set: { balance: val } }).then();
        });
      })
      // .then(() => {
      //   console.log('SOLIDITY Refill');
      //   contract.methods.refillDaily(tokenAddress, val*100).send(txData)
      //   .then((txRes) => {
      //     console.log('SOLIDITY Answer R');
      //     console.log(txRes);
      // });
      .catch((e) => {
        console.log(e);
      });
  });

  router.use("/me", isAuthenticated, (req, res) => {
    res.json(req.user);
  });

  router.get("/recs", isAuthenticated, (req, res) => {
    let { user } = req; // should look up in database? piping dat
    console.log("Rex attempted");
    console.log(JSON.stringify(user));
    console.log();
    // console.log(`lui : ${likedUsersIds}`);
    User.aggregate([
      {
        $match: {
          _id: { $ne: req.user._id },
          gender: { $eq: req.user.preference },
        },
      },
    ])
      .then((users) => {
        let brr = Object.keys(user.scores).map((u) => u.toString());
        let see = users.filter((f) => !brr.includes(f._id.toString()));
        res.json(see);
      })
      .catch((e) => {
        console.log(e);
      });
  });

  router.get("/matches", isAuthenticated, (req, res) => {
    let { user } = req;
    console.log(`Alice: ${user._id}`);
    let likedUsersIds = Object.keys(user.scores).filter(
      (id) => user.scores[id] > 0
    );
    console.log(`LikeduserIDs: ${likedUsersIds}`);
    User.find({ _id: { $in: likedUsersIds } }).then((likedUsers) => {
      console.log(`Likedusers: ${likedUsers}`);
      let mutualLikes = likedUsers.filter((u) => {
        if (!u.scores) {
          return false;
        } else {
          return u.scores[user._id] > 0;
        }
      });
      mutualLikes = mutualLikes.map((m) => ({
        displayName: m.displayName,
        _id: m._id,
        userID: m.userID,
      }));
      res.json({
        users: mutualLikes,
      });
    });
  });

  router.get("/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;

    User.findById(id, "-hashedPassword -salt").then((user) => {
      res.json(user);
    });
  });

  router.get("/:id/vote/:choice", isAuthenticated, (req, res) => {
    const {
      user,
      params: { id, choice },
    } = req;
    if (user._id == id) {
      res.json("Cannot Vote for Oneself!");
    }

    if (user.balance < 1) {
      res.json({ status: "Insufficient Funds." });
      return;
    }

    console.log("$".repeat(22) + `${choice}` + "$".repeat(22));
    if (!user.scores) {
      user.scores = {};
    }

    let result = choice == "up" ? +1 : -1;

    user.scores[id] = user.scores[id] ? user.scores[id] + result : result;

    console.log("User");
    console.log(user);

    if (choice == "up") {
      var userIds = [];
      var amounts = [];
      var rcps = [];

      console.log("Choice Up");
      User.findOne({ _id: id })
        .then((tgtUser) => {
          console.log("TGT");
          console.log(tgtUser);
          tgtUser.pot += 1;
          user.balance -= 1;

          var lastLikedBy = {};

          if (tgtUser.scores[user._id] > 0) {
            // Users are a match
            // Determine last 3 likes

            console.log("Match");

            const srcLLB = user.lastLikedBy;
            const tgtLLB = tgtUser.lastLikedBy;

            console.log(srcLLB);

            lastLikedBy = tgtLLB;

            for (var key in srcLLB) {
              if (srcLLB.hasOwnProperty(key)) {
                console.log(key + " -> " + srcLLB[key]);
                if (key != tgtUser._id) {
                  if (Object.keys(lastLikedBy).length == 3) {
                    let minTime = Object.keys(lastLikedBy).reduce((key, v) =>
                      obj[v] < obj[key] ? v : key
                    );
                    if (srcLLB[key] > minTime) {
                      delete lastLikedBy[minTime];
                      lastLikedBy[key] = srcLLB[key];
                    }
                  } else {
                    lastLikedBy[key] = srcLLB[key];
                  }
                }
              }
            }

            const totPot = user.pot + tgtUser.pot;
            user.pot = 0;
            tgtUser.pot = 0;

            var matchRwrd =
              (0.5 - Object.keys(lastLikedBy).length * 0.05) * totPot;
            var llbRwrd = 0.1 * totPot;
            user.balance += matchRwrd;
            tgtUser.balance += matchRwrd;

            console.log(matchRwrd);

            userIds = [bankID, bankID];
            amounts = [
              Math.round((matchRwrd - 1) * 100),
              Math.round(matchRwrd * 100),
            ];
            rcps = [user.userID, tgtUser.userID];

            // TODO: Get other users and update their balances to += 0.1*totPot;

            tgtUser.lastLikedBy = {};
            user.lastLikedBy = {};
          } else {
            console.log("Not a match yet");
            if (Object.keys(tgtUser.lastLikedBy).length == 4) {
              // lastLikedBy is full
              let minTime = Object.keys(tgtUser.lastLikedBy).reduce((key, v) =>
                obj[v] < obj[key] ? v : key
              );
              delete tgtUser.lastLikedBy[minTime];
            }

            // Add user to lastLikedBy

            const newTime = +new Date();
            tgtUser.lastLikedBy[user._id] = newTime;
            console.log(newTime);

            userIds = [user.userID];
            amounts = [100];
            rcps = [bankID];
          }

          var userUpdates = {
            scores: user.scores,
            balance: user.balance,
            pot: user.pot,
            lastLikedBy: user.lastLikedBy,
          };

          var tgtUserUpdates = {
            scores: tgtUser.scores,
            balance: tgtUser.balance,
            pot: tgtUser.pot,
            lastLikedBy: tgtUser.lastLikedBy,
          };

          console.log("Lets see");
          console.log(userUpdates);
          console.log(tgtUserUpdates);

          const txData = {
            from: sender,
            gasLimit: 3000000,
          };

          User.updateOne({ _id: tgtUser._id }, { $set: tgtUserUpdates }).then(
            () => {
              console.log("OK 1");
              User.updateOne({ _id: user._id }, { $set: userUpdates }).then(
                () => {
                  console.log("OK 2");
                  User.find({ _id: { $in: Object.keys(lastLikedBy) } })
                    .then((likedUsers) => {
                      console.log("Updating Users");
                      likedUsers.forEach((item, i) => {
                        console.log(`Updating User ${i}`);
                        item.balance += llbRwrd;
                        userIds.push(bankID);
                        amounts.push(Math.round(100 * llbRwrd));
                        rcps.push(item.userID);
                        item.save();
                      });
                    })
                    .then(() => {
                      // NO SOLIDITY

                      res.json({ score: user.scores[id] });

                      // WITH SOLIDITY

                      // console.log('SOLIDITY Send');
                      // contract.methods.sendFundsFromReceiversTo(userIds, tokenAddress, amounts, rcps).send(txData)
                      // .then((txRes) => {
                      //   console.log('SOLIDITY Answer');
                      //   console.log(txRes);
                      //   res.json({ score: user.scores[id] });
                      // })
                      // .catch((err) => {
                      //   console.log('ERROR adjnsk');
                      //   console.log(err);
                      // });
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }
              );
            }
          );
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      User.updateOne({ _id: user._id }, { $set: { scores: user.scores } }).then(
        res.json({ score: user.scores[id] })
      );
    }
    // user.save().then(res.json({ score: user.scores[id] }));
  });

  return router;
};
