const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");
const createHash = crypto.createHash;
var autoIncrement = require('mongoose-auto-increment');

const dbUri = "mongodb://localhost/amoreal";
const dbOptions = {
  promiseLibrary: require("bluebird"),
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

const db = mongoose.createConnection(dbUri, dbOptions);

autoIncrement.initialize(db);

const UserSchema = new Schema({
  email: { type: String, unique: true },
  displayName: String,
  hashedPassword: String,
	gender: String,
	preference: String,
	scores: {
			type: Object,
			default: {},
			/* another user id: 10 */
	},
  salt: String,
  balance: Number,
  userID: Number,
	avatars: [String],
  pot: {
    type: Number,
    default: 0,
  },
  lastLikedBy: {
    type: Object,
    default: {},
  },
});

//UserSchema.plugin(AutoIncrement, {inc_field: 'userID'});
UserSchema.plugin(autoIncrement.plugin, {model: 'User', field: 'userID'});

UserSchema.virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

UserSchema.methods = {
  makeSalt: function () {
    return crypto.randomBytes(16).toString("base64");
  },

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  encryptPassword: function (password) {
    if (!password || !this.salt) return "";
    let salt = Buffer.from(this.salt, "base64");
    return crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("base64");
  },
};

module.exports = (db) => db.model("User", UserSchema);
