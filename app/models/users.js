const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema({
    is_premium: { type: String, default: false },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    token: { type: String, default: "" },
    database: { type: String, default: "" },
    database_string: { type: String, default: "" },
    collection: { type: String, default: "" },
    charts: [{
        type: { type: String, default: true },
        name: { type: String, default: "" },
        query: { type: Array, default: [] },
        // collection:{type: String, default: []}
    }],
    password: { type: String },
    charts_catagory: { type: Array, default: [] },
    charts_subcatagory: { type: Array, default: [] },
    charts_array: { type: Array, default: [] }



}, {
    usePushEach: true
}, {
    strict: true,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});

    if (!user) {
        return ({ status: false, msg: "Email not registered" });
    }

    // user.password = "123456"
    // await user.save()

    // console.log(password);
    // password = "123456"

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
        return ({ status: false, msg: "Password not match" })
        // throw new Error("password not match");
    }
    return ({ status: true ,data:{user}});
};

UserSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

UserSchema.methods.generateAuthToken = async function () {
    const user = this;
    console.log(user);
    // const token = jwt.sign({_id:user._id.toString()},'thisismynewcourse',{expiresIn:'30 seconds'})
    const token = jwt.sign({ _id: user._id.toString() }, 'googleismine');
    user.token = token //user.tokens.concat({ token });
    await user.save();
    return user;
};


const User = mongoose.model("User", UserSchema);


module.exports = User
