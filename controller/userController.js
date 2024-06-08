import UserModel from "../model/User.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import transporter from "../config/email.js";

class UserController {
    static userRegistration = async (req, res) => {
        const {name, email, password, password_confirm, tc} = req.body;
        const user = await UserModel.findOne({
            email : email
        })

        if(user) {
            return res.json( {
                msg : "User already exists"
            })
        } else {
            if(name && password && password_confirm && tc) {
                if(password == password_confirm) {
                    try {
                        const salt = await bcrypt.genSalt(10);
                        const hash_password = await bcrypt.hash(password, salt);
                        const newUser = new UserModel({
                            name : name , 
                            email : email,
                            password : hash_password,
                            tc : tc
                        })
                        await newUser.save();
                        
                        const savedUser = await UserModel.findOne({
                            email : email
                        })

                        const token = jwt.sign({userId : savedUser._id}, process.env.JWT_SECRET_KEY, {expiresIn : '5d'});

                        return res.status(201).send( { 
                            "msg" : "User created successfully",
                            "token" : token
                        })

                    } catch (error) {
                        return res.json( {
                            'msg' : "Internal Server Error"
                        })
                    }
                }
            }
            else{
                return res.json( {
                    "msg" : "Enter all required fields"
                })
            }
        }
    }

    static userLogin = async (req, res) => {
        const {email, password} = req.body;
        if(email && password) {
            try {
                const user = await UserModel.findOne({
                    email : email
                })
        
                if(user!=null) {
                    const comparePassword = await bcrypt.compare(password, user.password);
                    if((email === user.email) && comparePassword) {
                        const savedUser = await UserModel.findOne({
                            email : email
                        })

                        const token = jwt.sign({userId : savedUser._id}, process.env.JWT_SECRET_KEY, {expiresIn : '5d'});

                        return res.json({
                            "msg" : "Login Successfull",
                            "token" : token 
                        })
                    } else {
                        return res.json({
                            "msg" : "Invalid credentials"
                        })
                    }
                } else { 
                    return res.json({
                        "msg" : "No such user found"
                    })
                }
            } catch (error) {
                return res.json({
                    "msg" : "Internal server error"
                })
            }
        }else { 
            return res.json({
                msg : "Enter all the required fields"
            })
        }
    }

    static  changePassword = async (req, res) => {
        const {password, newPassword} = req.body;
        if(password && newPassword ) {
            if(password == newPassword) {
                try {
                    const salt = await bcrypt.genSalt(10);
                    const hashNewPassword = await bcrypt.hash(newPassword, salt);
                    await UserModel.findByIdAndUpdate(req.user._id,
                        {
                            $set : {
                                password : hashNewPassword
                            }
                        }
                    );
                    console.log("Password changed");
                    res.json( { 
                        "msg" : "Password changed successfully"
                    })
                } catch (error) {
                    return res.json( { 
                        "msg" : "Internal server error"
                    })
                }
            } else  {
                return res.json ( {
                    "msg" : "Both passwords don't match"
                })
            }
        } else {
            return res.json( {
                "msg" : "Enter all required fields"
            })
        }
    }

    static loggedUser = (req, res) => {
        return res.json({
            "user" : req.user
        })
    }

    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body;
        if (email) {
            const user = await UserModel.findOne({ email: email });
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY;
                const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' });
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
                
                // Send Email
                try {
                    let info = await transporter.sendMail({
                        from: process.env.EMAIL_FROM,
                        to: user.email,
                        subject: "Password Reset Link",
                        html: `<a href="${link}">Click Here</a> to Reset Your Password`
                    });
                    res.send({ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email" });
                } catch (error) {
                    console.error('Error sending email:', error);
                    res.send({ "status": "failed", "message": "Error sending email" });
                }
            } else {
                res.send({ "status": "failed", "message": "Email doesn't exist" });
            }
        } else {
            res.send({ "status": "failed", "message": "Email Field is Required" });
        }
    };

    static userPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body
        const { id, token } = req.params
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
          jwt.verify(token, new_secret)
          if (password && password_confirmation) {
            if (password !== password_confirmation) {
              res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
            } else {
              const salt = await bcrypt.genSalt(10)
              const newHashPassword = await bcrypt.hash(password, salt)
              await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } })
              res.send({ "status": "success", "message": "Password Reset Successfully" })
            }
          } else {
            res.send({ "status": "failed", "message": "All Fields are Required" })
          }
        } catch (error) {
          console.log(error)
          res.send({ "status": "failed", "message": "Invalid Token" })
        }
      }
}

export default UserController
