import jwt from "jsonwebtoken";
import UserModel from "../model/User.js";

const userAuth = async (req, res, next) => {
    const {authorization} = req.headers;
    if(authorization) {
        if(authorization.startsWith("Bearer")){ 
            try {
                const token = authorization.split(" ")[1];
            const {userId} = jwt.verify(token , process.env.JWT_SECRET_KEY);
            req.user = await UserModel.findById(userId).select("-password");
            next();
            } catch (error) {
                return res.json( {
                    "msg" : "Unauthorised User"
                })
            }
        }else {
            return res.json( {
                "msg" : "Unauthorised User"
            })
        }
    }else { 
        return res.json({
            "msg" : "No auth token found"
        })
    }
}

export default userAuth