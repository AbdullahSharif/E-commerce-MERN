const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required!"],
        maxlength: [40, "Name cannot be more than 40 characters long."],
        minlength: [4, "Name must be atleast 4 characters long."]
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: [true, "User already registered!"],
        validate: [validator.isEmail, "Please enter a valid email!"]
    },
    password: {
        type: String,
        required: [true, "Password is required!"],
        minlength: [8, "Password must be atleast 8 characters long!"],
        maxlength: [100, "Password cannot be longer than 100 characters!"],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date

})

// now we need to hash the pasword when the password is modified.
userSchema.pre("save", async function (next) {
    if (this.isModified(["password"])) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);

        } catch (exc) {
            next(exc);
        }
    }
    return;
})
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}


userSchema.methods.getJwtToken = function () {
    const jwtToken = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
    return jwtToken;
}


userSchema.methods.getResetPasswordToken = function () {
    // generate token
    const token = crypto.randomBytes(20).toString("hex");
    // generate hash
    this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return token;
}



module.exports = mongoose.model('user', userSchema);